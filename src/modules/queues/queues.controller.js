const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { stockSyncQueue, retrySyncQueue, notificationQueue } = require('./queue.registry');

const listQueues = asyncHandler(async (_req, res) => {
  const jobTypes = ['waiting', 'active', 'completed', 'failed', 'delayed'];
  
  // Fetch up to 50 jobs per queue to avoid memory overload
  const [stockJobs, retryJobs, notificationJobs] = await Promise.all([
    stockSyncQueue.getJobs(jobTypes, 0, 50),
    retrySyncQueue.getJobs(jobTypes, 0, 50),
    notificationQueue.getJobs(jobTypes, 0, 50)
  ]);

  const allRawJobs = [...stockJobs, ...retryJobs, ...notificationJobs];
  
  // Map jobs concurrently
  const mappedJobs = await Promise.all(allRawJobs.map(async (job) => {
    let state = 'PENDING';
    try {
      state = await job.getState();
    } catch (e) {}

    const statusMap = {
      waiting: 'PENDING',
      delayed: 'PENDING',
      active: 'PROCESSING',
      completed: 'SUCCESS',
      failed: 'FAILED',
      stuck: 'FAILED'
    };

    return {
      id: job.id,
      type: job.name,
      status: statusMap[state] || 'PENDING',
      payload: job.data,
      attempts: job.attemptsMade || 0,
      maxAttempts: job.opts?.attempts || 3,
      createdAt: job.timestamp,
      updatedAt: job.finishedOn || job.processedOn || job.timestamp,
      error: job.failedReason || null
    };
  }));

  // Sort by createdAt descending
  mappedJobs.sort((a, b) => b.createdAt - a.createdAt);

  return ok(res, mappedJobs, 'Queues fetched');
});

const retryJob = asyncHandler(async (req, res) => {
  const failedJob = await stockSyncQueue.getJob(req.params.id);

  if (!failedJob) {
    return ok(res, null, 'Job not found');
  }

  await retrySyncQueue.add('retry-sync', failedJob.data);
  return ok(res, { jobId: req.params.id }, 'Retry job enqueued');
});

module.exports = {
  listQueues,
  retryJob
};
