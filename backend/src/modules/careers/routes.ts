import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export const careersRouter = Router();

import { ALL_OPEN_JOBS, JobOpening } from './jobsData.js';

export const OPEN_JOBS: JobOpening[] = ALL_OPEN_JOBS;

// GET /api/careers/jobs - Public endpoint to list all openings
careersRouter.get('/jobs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: OPEN_JOBS,
    total: OPEN_JOBS.length,
  });
});

// POST /api/careers/apply - Public endpoint to submit application
careersRouter.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      jobId,
      jobTitle,
      department,
      fullName,
      email,
      phone,
      experience,
      currentCompany,
      portfolioUrl,
      linkedinUrl,
      resumeUrl,
      coverNote,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      throw new AppError('Full Name is required', 400, 'VALIDATION_ERROR');
    }
    if (!email || !email.trim() || !email.includes('@')) {
      throw new AppError('Valid Email address is required', 400, 'VALIDATION_ERROR');
    }
    if (!phone || !phone.trim()) {
      throw new AppError('Mobile Phone number is required', 400, 'VALIDATION_ERROR');
    }
    if (!jobTitle) {
      throw new AppError('Position applied for is required', 400, 'VALIDATION_ERROR');
    }

    const application = await db.createJobApplication({
      jobId: jobId || 'custom-role',
      jobTitle: jobTitle.trim(),
      department: department || 'General',
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      experience: experience || 'Not specified',
      currentCompany: currentCompany?.trim() || '',
      portfolioUrl: portfolioUrl?.trim() || '',
      linkedinUrl: linkedinUrl?.trim() || '',
      resumeUrl: resumeUrl?.trim() || '',
      coverNote: coverNote?.trim() || '',
      status: 'PENDING',
    });

    // Notify Super Admin through System Notifications
    try {
      await db.createNotification({
        title: `New Candidate: ${fullName.trim()} applied for ${jobTitle}`,
        message: `${fullName.trim()} submitted an application for ${jobTitle} (${department || 'Team'}). Experience: ${experience || 'N/A'}. Phone: ${phone.trim()}. Email: ${email.trim()}`,
        type: 'INFO',
      });
    } catch {
      // Non-fatal notification failure
    }

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application received successfully! Our talent team will review your application within 48 hours.',
    });
  } catch (error) {
    next(error);
  }
});
