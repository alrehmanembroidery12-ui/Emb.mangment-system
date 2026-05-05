const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendVerificationEmail = async (email, token, name) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
        from: `"Core Logic SaaS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Core Logic Embroidery SaaS',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Core Logic</h1>
                    <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-top: 5px;">Embroidery Management System</p>
                </div>
                
                <div style="padding: 20px; color: #374151; line-height: 1.6;">
                    <h2 style="font-size: 20px; color: #111827;">Hello ${name},</h2>
                    <p>Welcome to Core Logic! We're excited to have you on board. To start using your embroidery management system, please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${verificationUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">Verify My Email</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${verificationUrl}</p>
                </div>
                
                <div style="border-top: 1px solid #f3f4f6; margin-top: 30px; padding-top: 20px; text-align: center;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">This email was sent to ${email}. If you didn't create an account, you can safely ignore this email.</p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 5px;">&copy; 2026 Core Logic Inc. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (err) {
        console.error('Email Send Error:', err);
        throw new Error('Failed to send verification email');
    }
};
