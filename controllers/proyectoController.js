import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");
  res.json(proyectos);
};
const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findOne({ _id: id })
      .populate({
        path: "tareas",
        populate: { path: "completado", select: "nombre" },
      })
      .populate("colaboradores", "nombre email");

    if (!proyecto) {
      const error = new Error("No Encontrado");
      return res.status(404).json({ msg: error.message });
    }

    if (
      proyecto.creador.toString() !== req.usuario._id.toString() &&
      !proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("Accion no valida");
      return res.status(401).json({ msg: error.message });
    }

    return res.json(proyecto);
  } catch (error) {
    return res
      .status(404)
      .json({ msg: "Error de identificacion Proyecto no encontrado" });
  }
};
const editarProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findOne({ _id: id });

    if (!proyecto) {
      const error = new Error("No Encontrado");
      return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Accion no valida");
      return res.status(401).json({ msg: error.message });
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
      const proyectoAlmacenado = await proyecto.save();
      return res.json(proyecto);
    } catch (error) {
      return res.status(404).json({ msg: "No se pudo Actualizar el proyecto" });
    }
  } catch (error) {
    return res.status(404).json({ msg: "Error de identificacion" });
  }
};
const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findOne({ _id: id });

    if (!proyecto) {
      const error = new Error("No Encontrado");
      return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Accion no valida");
      return res.status(401).json({ msg: error.message });
    }
    try {
      await proyecto.deleteOne();
      return res.json({ msg: "Proyecto eliminado" });
    } catch (error) {
      return res.status(404).json({ msg: "No se pudo borrar el proyecto" });
    }
  } catch (error) {
    return res.status(404).json({ msg: "Error de identificacion" });
  }
};
const obtenerTareas = async (req, res) => {
  const { id } = req.params;

  const existeProyecto = await Proyecto.findById(id);
  if (!existeProyecto) {
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  const tareas = await Tarea.find().where("proyecto").equals(id);

  return res.json(tareas);
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  return res.json(usuario);
};
const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(404).json({ msg: error.message });
  }
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El Creador del proyecto no puede ser colaborador");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("EL usuario ya se encuentra como colaborador");
    return res.status(404).json({ msg: error.message });
  }
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "Colaborador agregado correctamente" });
};
const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(404).json({ msg: error.message });
  }

  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({ msg: "Colaborador eliminado correctamente" });
};
export {
  obtenerProyectos,
  obtenerProyecto,
  nuevoProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  obtenerTareas,
  buscarColaborador,
};
