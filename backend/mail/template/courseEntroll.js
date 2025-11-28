module.exports = function courseEnrollTemplate(name, courseName) {
    return `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:12px; 
                    box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <h2 style="color:#4A90E2; margin-top:0;">🎉 Enrollment Successful!</h2>

            <p style="font-size:16px; color:#333;">
                Hi <strong>${name}</strong>,
            </p>

            <p style="font-size:15px; color:#555;">
                Congratulations! You have been successfully enrolled in:
                <br>
                <strong style="font-size:18px; color:#27ae60;">${courseName}</strong>
            </p>

            <p style="font-size:15px; color:#333; line-height:1.6;">
                We are excited to have you on board!  
                Your learning journey starts today 🚀  
                Log in anytime and start exploring the course content.
            </p>

            <div style="text-align:center; margin:30px 0;">
                <a href="#" 
                   style="background:#4A90E2; color:#fff; padding:12px 22px; text-decoration:none;
                          border-radius:8px; font-size:16px;">
                    Go to My Courses
                </a>
            </div>

            <p style="font-size:13px; color:#777;">
                If you need any assistance, feel free to reach out to our support team.
            </p>

            <p style="font-size:15px; margin-top:25px;">
                Best Regards,<br>
                <strong>CodeMaster Academy Team</strong>
            </p>

        </div>
    </div>
    `;
};
