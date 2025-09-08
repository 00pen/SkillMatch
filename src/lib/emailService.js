// Email Service for SkillMatch Application
// This service handles email notifications for application status changes

import { db } from './supabase';

class EmailService {
  constructor() {
    this.emailProvider = 'mock'; // In production, this would be 'sendgrid', 'ses', etc.
  }

  /**
   * Send email notification for application status change
   * @param {Object} emailData - Email data object
   * @param {string} emailData.to - Recipient email
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.content - Email content
   * @param {string} emailData.applicationId - Application ID
   * @param {string} emailData.notificationType - Type of notification
   */
  async sendApplicationStatusEmail(emailData) {
    try {
      // In production, this would integrate with a real email service
      // For now, we'll simulate email sending and log to console
      
      console.log('📧 Sending Email Notification:');
      console.log('To:', emailData.to);
      console.log('Subject:', emailData.subject);
      console.log('Type:', emailData.notificationType);
      console.log('Content Preview:', emailData.content.substring(0, 100) + '...');
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update email notification status in database
      await this.updateEmailNotificationStatus(emailData.applicationId, 'sent');
      
      // In production, you would use a service like:
      // - SendGrid
      // - Amazon SES
      // - Mailgun
      // - Resend
      // - Nodemailer with SMTP
      
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
        message: 'Email sent successfully'
      };
      
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update email notification status as failed
      if (emailData.applicationId) {
        await this.updateEmailNotificationStatus(emailData.applicationId, 'failed');
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update email notification delivery status
   * @param {string} applicationId - Application ID
   * @param {string} status - Delivery status (sent, delivered, failed)
   */
  async updateEmailNotificationStatus(applicationId, status) {
    try {
      // Get the most recent email notification for this application
      const { data: notifications, error } = await db.getEmailNotifications(applicationId);
      
      if (error || !notifications || notifications.length === 0) {
        return;
      }
      
      // Update the most recent notification
      const latestNotification = notifications[0];
      await db.supabase
        .from('email_notifications')
        .update({ delivery_status: status })
        .eq('id', latestNotification.id);
        
    } catch (error) {
      console.error('Error updating email notification status:', error);
    }
  }

  /**
   * Send interview reminder email
   * @param {Object} interviewData - Interview data
   */
  async sendInterviewReminder(interviewData) {
    const emailData = {
      to: interviewData.candidateEmail,
      subject: `Interview Reminder - ${interviewData.jobTitle}`,
      content: this.generateInterviewReminderContent(interviewData),
      applicationId: interviewData.applicationId,
      notificationType: 'interview_reminder'
    };
    
    return await this.sendApplicationStatusEmail(emailData);
  }

  /**
   * Generate interview reminder email content
   * @param {Object} interviewData - Interview data
   */
  generateInterviewReminderContent(interviewData) {
    const interviewDate = new Date(interviewData.scheduledAt);
    const formattedDate = interviewDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = interviewDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
Dear ${interviewData.candidateName},

This is a friendly reminder about your upcoming interview for the ${interviewData.jobTitle} position at ${interviewData.companyName}.

Interview Details:
📅 Date: ${formattedDate}
🕐 Time: ${formattedTime}
📍 Type: ${interviewData.interviewType === 'video' ? 'Video Call' : interviewData.interviewType === 'phone' ? 'Phone Call' : 'In-Person'}
${interviewData.location ? `🔗 Location/Link: ${interviewData.location}` : ''}

Please make sure to:
✅ Join the meeting 5 minutes early
✅ Test your audio/video (for video interviews)
✅ Have your resume and portfolio ready
✅ Prepare questions about the role and company

If you need to reschedule or have any questions, please contact us as soon as possible.

We look forward to speaking with you!

Best regards,
${interviewData.companyName} Hiring Team

---
This is an automated message from SkillMatch. Please do not reply to this email.
    `.trim();
  }

  /**
   * Send bulk email notifications
   * @param {Array} emailList - List of email data objects
   */
  async sendBulkEmails(emailList) {
    const results = [];
    
    for (const emailData of emailList) {
      const result = await this.sendApplicationStatusEmail(emailData);
      results.push({
        ...emailData,
        result
      });
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * Schedule interview reminder emails
   * @param {string} applicationId - Application ID
   * @param {Date} interviewDate - Interview date
   */
  async scheduleInterviewReminders(applicationId, interviewDate) {
    // In production, this would integrate with a job queue system
    // like Bull, Agenda, or cloud-based solutions
    
    const reminderTimes = [
      { hours: 24, label: '24 hours before' },
      { hours: 2, label: '2 hours before' }
    ];
    
    console.log(`📅 Scheduling interview reminders for application ${applicationId}:`);
    
    reminderTimes.forEach(reminder => {
      const reminderTime = new Date(interviewDate.getTime() - (reminder.hours * 60 * 60 * 1000));
      console.log(`  - ${reminder.label}: ${reminderTime.toLocaleString()}`);
    });
    
    // In production, you would schedule these with a job queue:
    // await jobQueue.add('interview-reminder', {
    //   applicationId,
    //   reminderType: '24h',
    //   scheduledFor: reminderTime
    // });
    
    return {
      success: true,
      remindersScheduled: reminderTimes.length
    };
  }

  /**
   * Get email templates for different notification types
   * @param {string} templateType - Type of template
   */
  getEmailTemplate(templateType) {
    const templates = {
      application_received: {
        subject: 'Application Received - {{job_title}} at {{company_name}}',
        content: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}. We have received your application and our team will review it carefully.

We will contact you within the next few business days regarding the next steps in our hiring process.

Best regards,
{{company_name}} Hiring Team`
      },
      
      interview_scheduled: {
        subject: 'Interview Invitation - {{job_title}} at {{company_name}}',
        content: `Dear {{candidate_name}},

Congratulations! We would like to invite you for an interview for the {{job_title}} position at {{company_name}}.

Interview Details:
📅 Date: {{interview_date}}
🕐 Time: {{interview_time}}
📍 Type: {{interview_type}}
🔗 Location/Link: {{interview_location}}

Please confirm your availability by replying to this message.

We look forward to speaking with you!

Best regards,
{{company_name}} Hiring Team`
      },
      
      offer_extended: {
        subject: 'Job Offer - {{job_title}} at {{company_name}}',
        content: `Dear {{candidate_name}},

We are pleased to extend an offer for the {{job_title}} position at {{company_name}}!

Please review the attached offer details and let us know your decision by {{offer_deadline}}.

We are excited about the possibility of you joining our team!

Best regards,
{{company_name}} Hiring Team`
      },
      
      application_rejected: {
        subject: 'Application Update - {{job_title}} at {{company_name}}',
        content: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We wish you the best in your job search.

Best regards,
{{company_name}} Hiring Team`
      }
    };
    
    return templates[templateType] || null;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
