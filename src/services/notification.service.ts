import { PrismaClient, NotificationChannel, NotificationProvider, TemplateFormat, NotificationStatus } from "@prisma/client"
import Handlebars from "handlebars"
import { mailjetTransport } from "../middleware/mailjet.js"

const prisma = new PrismaClient()

interface SendNotificationOptions {
  templateName: string
  recipient: string
  variables?: Record<string, any>
  userId?: string
  channel?: NotificationChannel
}
interface SendConsultNotificationOptions {
  templateName: string
  recipient: string
  
  consultId: string
  senderId: string
  channel?: NotificationChannel
}

class NotificationService {
    /* async sendConsult({
        templateName,
        recipient,
        consultId,
        senderId,
        channel = NotificationChannel.EMAIL
    }: SendConsultNotificationOptions){

    } */

  async send({
    templateName,
    recipient,
    variables = {},
    userId,
    channel = NotificationChannel.EMAIL
  }: SendNotificationOptions) {

    // 1. Fetch template
    const template = await prisma.template.findFirst({
      where: {
        name: templateName,
        isActive: true,
        channel
      }
    })

    if (!template) {
      throw new Error(`Template "${templateName}" not found or inactive`)
    }

    const format = template.htmlBody
      ? TemplateFormat.HTML
      : TemplateFormat.TEXT

    const rawBody =
      format === TemplateFormat.HTML
        ? template.htmlBody
        : template.textBody

    if (!rawBody) {
      throw new Error(`Template body is empty for template: ${template.name}`)
    }

    // 2. Compile with Handlebars
    const compiledTemplate = Handlebars.compile(rawBody)
    const finalBody = compiledTemplate(variables)

    const subject = template.subject
      ? Handlebars.compile(template.subject)(variables)
      : undefined

    // 3. Create notification row
    const notification = await prisma.notification.create({
      data: {
        ...(userId && { userId }),
        templateId: template.id,
        channel,
        provider: NotificationProvider.MAILJET,
        recipient,
        subject: subject ?? "",
        body: finalBody,
        format,
        variables,
        status: NotificationStatus.PENDING
      }
    })

    try {
      // 4. Send email via Mailjet
      if (channel === NotificationChannel.EMAIL) {

        await mailjetTransport.sendMail({
          from: process.env.MAILJET_FROM_EMAIL,
          to: recipient,
          subject,
          text: format === TemplateFormat.TEXT ? finalBody : undefined,
          html: format === TemplateFormat.HTML ? finalBody : undefined
        })

      } else {
        throw new Error("Only EMAIL is implemented currently")
      }

      // 5. Update to SENT
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date()
        }
      })

      return { success: true }

    } catch (error: any) {

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: error.message
        }
      })

      throw error
    }
  }
}

export const notificationService = new NotificationService()
