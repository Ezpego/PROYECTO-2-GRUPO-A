import nodemailer from "nodemailer";




// const transport = nodemailer.createTransport({
//   service: "sendinblue",
//   port: 465, // Puedes usar 465 para SSL o 587
//   auth: {
//     user: "ezpego@gmail.com",
//     pass: "12345678felizcodigo"
//   },
// });

const transport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Reemplaza 'smtp.brevo.com' con el host de tu servidor de correo saliente de Brevo
  port: 587, // Puerto SMTP para Brevo (reemplaza con el puerto correspondiente si es diferente)
  secure: false, // Puede ser verdadero si necesitas usar SSL/TLS
  auth: {
    user: 'ezpego@gmail.com', // Reemplaza con tu dirección de correo electrónico de Brevo
    pass: 'YxSVHaE1cWM0LtbU' // Reemplaza con tu contraseña de Brevo
  }
});

export async function sendRegisterConfirmation(code, email) {
  try {
    const info = await transport.sendMail({
      from: "ezpego@gmail.com",
      to: email,
      subject: "DbGym - Código de Confirmación",
      text: "Este es el código de confirmación: " + code,
    });
    console.log("Correo enviado: " + info.response);
  } catch (err) {
    console.error(err);
  }
}
