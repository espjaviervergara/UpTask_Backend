import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  try {
    const existeProyecto = await Proyecto.findOne({ _id: proyecto });

    if (!existeProyecto) {
      const error = new Error("Proyecto No Encontrado");
      return res.status(404).json({ msg: error.message });
    }

    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Accion no valida");
      return res.status(403).json({ msg: error.message });
    }
    try {
      const tareaAlmacenada = await Tarea.create(req.body);
      existeProyecto.tareas.push(tareaAlmacenada._id);
      await existeProyecto.save();
      return res.json(tareaAlmacenada);
    } catch (error) {
      return res.status(401).json({ msg: error.message });
    }
  } catch (error) {
    return res.status(404).json({ msg: "Error de identificacion" });
  }
};
const obtenerTarea = async (req, res) => {
  const { id } = req.params;

  try {
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
      const error = new Error("Tarea No Encontrado");
      return res.status(401).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Accion no valida");
      return res.status(403).json({ msg: error.message });
    }

    return res.json(tarea);
  } catch (error) {
    return res.status(404).json({ msg: "Error de identificacion" });
  }
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;

  try {
    const tarea = await Tarea.findById(id).populate("proyecto");

    if (!tarea) {
      const error = new Error("Tarea No Encontrado");
      return res.status(401).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Accion no valida");
      return res.status(403).json({ msg: error.message });
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
      const tareaAlmacenada = await tarea.save();

      return res.json(tareaAlmacenada);
    } catch (error) {
      return res.status(404).json({ msg: "Error al actualizar la tarea" });
    }
  } catch (error) {
    return res.status(404).json({ msg: "Error de identificacion" });
  }
};
const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
      const error = new Error("Tarea No Encontrado");
      return res.status(401).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Accion no valida");
      return res.status(403).json({ msg: error.message });
    }

    try {
      const proyecto = await Proyecto.findById(tarea.proyecto);
      proyecto.tareas.pull(tarea._id);
      await Promise.allSettled([
        await tarea.deleteOne(),
        await proyecto.save(),
      ]);
      return res.json({ msg: "Tarea Eliminada" });
    } catch (error) {
      return res.status(404).json({ msg: "Error al Eliminar la tarea" });
    }
  } catch (error) {
    return res.status(404).json({ msg: "Error de identificacion" });
  }
};
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");
  if (!tarea) {
    const error = new Error("Tarea No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Accion no valida");
    return res.status(403).json({ msg: error.message });
  }
  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();
  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");
  res.json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
