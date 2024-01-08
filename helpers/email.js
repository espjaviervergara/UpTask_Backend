import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;

  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuenta@uptask.com> ', // sender address
    to: email, // list of receivers
    subject: "UpTask - Comprueba tu cuenta", // Subject line
    text: "Comprueba tu cuenta en UpTask", // plain text body
    html: `<p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya casi esta lista, solo debes comprobarla en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
        <p>Si tu no creaste esta cuenta puedes ignorar este mensaje</p>
      `, // html body
  });
};

export const emailOlvidePassword = async (datos) => {
  const { nombre, email, token } = datos;

  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuenta@uptask.com> ', // sender address
    to: email, // list of receivers
    subject: "UpTask - Reestablece tu Password", // Subject line
    text: "Reestablece tu Password en UpTask", // plain text body
    html: `<p>Hola: ${nombre} Pediste reestablecer tu password UpTask</p>
        <p>Sigue el enlace para reestablecer tu password:</p>
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
        <p>Si tu no solicitaste este email, puedes ignorar este mensaje</p>
      `, // html body
  });
};
