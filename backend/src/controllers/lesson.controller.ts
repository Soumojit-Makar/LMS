import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Lesson } from '../models/Lesson.model';
import { Module } from '../models/Module.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { extractYouTubeId } from '../utils/youtube';
import { issuePlaybackToken } from '../utils/playbackToken';

async function assertTrainerOwnsLesson(lessonId: string, trainerId: string) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ApiError(404, 'Lesson not found');
  const course = await Course.findById(lesson.course);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.trainer.toString() !== trainerId) throw new ApiError(403, 'Not authorized');
  return lesson;
}

export const createLesson = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { module: moduleId, course, title, type, order, isFreePreview, content, duration, youtubeUrl } = req.body;

    const courseDoc = await Course.findById(course);
    if (!courseDoc) throw new ApiError(404, 'Course not found');
    if (courseDoc.trainer.toString() !== req.user!.id) throw new ApiError(403, 'Not authorized');

    let finalContent = content || {};
    let finalType = type;
    let finalDuration = duration || 0;

    // Handle YouTube URL → extract ID, never store the full URL
    if (youtubeUrl) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) throw new ApiError(400, 'Invalid YouTube URL. Paste a valid youtube.com or youtu.be link.');
      finalType = 'youtube';
      finalContent = { youtube: { videoId, duration: duration || 0 } };
    }

    const lesson = await Lesson.create({
      module: moduleId,
      course,
      title,
      type: finalType,
      order,
      isFreePreview: isFreePreview || false,
      content: finalContent,
      duration: finalDuration,
    });

    await Course.findByIdAndUpdate(course, {
      $inc: { totalLessons: 1, totalDuration: finalDuration },
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

export const updateLesson = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await assertTrainerOwnsLesson(req.params.id, req.user!.id);

    const { youtubeUrl, ...rest } = req.body;
    const updates: Record<string, any> = {};

    // If trainer is updating the YouTube URL
    if (youtubeUrl !== undefined) {
      if (youtubeUrl === '') {
        updates['content.youtube'] = undefined;
        updates.type = 'text';
      } else {
        const videoId = extractYouTubeId(youtubeUrl);
        if (!videoId) throw new ApiError(400, 'Invalid YouTube URL');
        updates['content.youtube'] = { videoId, duration: rest.duration || 0 };
        updates.type = 'youtube';
      }
    }

    const allowed = ['title', 'order', 'isFreePreview', 'isPublished', 'content', 'duration'];
    allowed.forEach((k) => { if (rest[k] !== undefined) updates[k] = rest[k]; });

    const updated = await Lesson.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lesson = await assertTrainerOwnsLesson(req.params.id, req.user!.id);

    if (lesson.content?.video?.publicId) {
      try {
        await cloudinary.uploader.destroy(lesson.content.video.publicId, { resource_type: 'video' });
      } catch (e) {
        console.warn('Cloudinary delete failed:', e);
      }
    }

    await Course.findByIdAndUpdate(lesson.course, {
      $inc: { totalLessons: -1, totalDuration: -(lesson.duration || 0) },
    });
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    next(err);
  }
};

export const reorderLessons = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { moduleId, orderedIds } = req.body;
    const mod = await Module.findById(moduleId);
    if (!mod) throw new ApiError(404, 'Module not found');
    const course = await Course.findById(mod.course);
    if (!course || course.trainer.toString() !== req.user!.id) throw new ApiError(403, 'Not authorized');
    const ops = (orderedIds as string[]).map((id, index) =>
      Lesson.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Lessons reordered' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/lessons/:id/stream-url
 *
 * For YouTube lessons: returns a short-lived signed playback token.
 * The videoId is NEVER returned directly — only the token.
 * The frontend exchanges the token at /api/lessons/:id/playback-frame.
 *
 * For Cloudinary video/PDF: returns a signed Cloudinary URL.
 */
export const getStreamUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson || !lesson.isPublished) throw new ApiError(404, 'Lesson not found');


    if (!lesson.isFreePreview) {
      if (!['admin', 'trainer'].includes(req.user!.role)) {
        const enrollment = await Enrollment.findOne({
          student: req.user!.id,
          course: lesson.course,
        });
        if (!enrollment) throw new ApiError(403, 'Enroll in this course to access this lesson');
      }
    }

    if (lesson.type === 'youtube') {
      if (!lesson.content?.youtube?.videoId) throw new ApiError(404, 'No YouTube video attached');
      // Issue a short-lived token — videoId stays server-side
      const token = issuePlaybackToken({
        videoId: lesson.content.youtube.videoId,
        userId: req.user!.id,
        courseId: lesson.course.toString(),
      }, 3600); // 1-hour TTL

      return res.json({ success: true, data: { type: 'youtube', playbackToken: token } });
    }

    if (lesson.type === 'video') {
      if (!lesson.content?.video?.publicId) throw new ApiError(404, 'No video attached');
      const expiresAt = Math.round(Date.now() / 1000) + 600;
      const url = cloudinary.url(lesson.content.video.publicId, {
        resource_type: 'video',
        type: 'authenticated',
        sign_url: true,
        expires_at: expiresAt,
        format: 'mp4',
      });
      return res.json({ success: true, data: { type: 'video', url, expiresAt } });
    }

    if (lesson.type === 'pdf') {
      if (!lesson.content?.pdf?.publicId) throw new ApiError(404, 'No PDF attached');
      const url = cloudinary.url(lesson.content.pdf.publicId, {
        resource_type: 'raw',
        type: 'authenticated',
        sign_url: true,
        expires_at: Math.round(Date.now() / 1000) + 600,
      });
      return res.json({ success: true, data: { type: 'pdf', url, filename: lesson.content.pdf.filename } });
    }

    res.json({ success: true, data: { type: lesson.type, content: lesson.content?.text } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/lessons/:id/playback-frame?token=<playbackToken>
 *
 * Verifies the token, then returns an HTML page that embeds the YouTube
 * player with all sharing/info/controls stripped.
 * This HTML is loaded inside a sandboxed <iframe> in the frontend —
 * the YouTube URL is therefore ONLY visible inside this server response,
 * never in the React bundle or browser console.
 */
export const getPlaybackFrame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { verifyPlaybackToken } = await import('../utils/playbackToken');

    const token = req.query.token as string;
    if (!token) throw new ApiError(400, 'Missing playback token');

    const payload = verifyPlaybackToken(token);

    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson || !lesson.isPublished) {
      throw new ApiError(404, 'Lesson not found');
    }

    if (lesson.course.toString() !== payload.courseId) {
      throw new ApiError(403, 'Invalid playback token');
    }

    const vid = payload.videoId;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;background:#000;overflow:hidden}
  iframe{width:100%;height:100%;border:0;display:block}
</style>
</head>
<body>
<iframe
  src="https://www.youtube.com/embed/${vid}?autoplay=0&controls=1&rel=0&modestbranding=1&origin=https://lms.digitalindian.org"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    // ✅ IMPORTANT: do not block React app iframe
    res.removeHeader('X-Frame-Options');

    res.setHeader(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://lms.digitalindian.org"
    );

    res.send(html);
  } catch (err) {
    next(err);
  }
};