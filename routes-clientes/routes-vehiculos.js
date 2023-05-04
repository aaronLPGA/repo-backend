// rutas-cursos.js
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Vehiculo = require("../models-clients/models-vehiculos");
const Cliente = require("../models-clients/models-clients");

const checkAuth = require("../midelware/Autorizacion"); // (1) Importamos middleware de autorización


// * Buscar un curso en función del parámetro de búsqueda
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  console.log(search);
  let vehiculos;
  try {
    vehiculos = await Vehiculo.find({
      coche: { $regex: search, $options: "i" },
    }).populate("cliente");
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({ mensaje: "Todos los cursos", vehiculos: vehiculos });
});

// ! Middleware para autorización
// router.use(checkAuth);

// * Crear un nuevo curso y guardarlo en Atlas
// router.post('/', async (req, res, next) => {
// 	const nuevoCurso = new Curso({
// 		// Nuevo documento basado en el Model Curso.
// 		curso: req.body.curso,
// 		docente: req.body.docente,
// 		opcion: req.body.opcion,
// 		aula: req.body.aula,
// 		precio: req.body.precio,
// 	});
// 	try {
// 		await nuevoCurso.save(); // Guardar en MongoDB Atlas
// 	} catch (error) {
// 		console.log(error.message);
// 		const err = new Error('No se han podido guardar los datos');
// 		err.code = 500;
// 		return next(err);
// 	}
// 	res.status(201).json({
// 		mensaje: 'Curso añadido a la BDD',
// 		curso: nuevoCurso,
// 	});
// });

// * Crear un nuevo curso (y el docente relacionado) y guardarlo en Atlas
router.post("/", async (req, res, next) => {
  // ? Primero creamos el curso y lo guardamos en Atlas
  const { coche,cliente,nombre, matricula, hora, plaza } = req.body;
  const nuevoCoche = new Vehiculo({
    // Nuevo documento basado en el Model Curso.
    coche,
    cliente,
    nombre,
    matricula,
    hora,
    plaza,
    
  });
  // ? Localizamos al docente que se corresponde con el que hemos recibido en el request
  let clienteBusca;
  try {
    clienteBusca = await Cliente.findById(req.body.cliente);
  } catch (error) {
    const err = new Error("Ha fallado la operación de creación");
    err.code = 500;
    return next(err);
  }
  console.log(clienteBusca);
  // ? Si no está en la BDD mostrar error y salir
  if (!clienteBusca) {
    const error = new Error(
      "No se ha podido encontrar un docente con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  /**
   * ? Si está en la BDD tendremos que:
   * ?  1 - Guardar el nuevo curso
   * ?  2 - Añadir el nuevo curso al array de cursos del docente id
   * ?  3 - Guardar el docente, ya con su array de cursos actualizado
   */
  console.log(clienteBusca);
  try {
    await nuevoCoche.save(); // ? (1)
    clienteBusca.vehiculos.push(nuevoCoche); // ? (2)
    await clienteBusca.save(); // ? (3)
  } catch (error) {
    const err = new Error("Ha fallado la creación del nuevo curso");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    mensaje: "Coche añadido a la BDD",
    coche: nuevoCoche,
  });
});

router.patch("/:id", async (req, res, next) => {
  const idCoche = req.params.id;
  let cocheBuscar;
  try {
    cocheBuscar = await Vehiculo.findById(idCoche).populate("cliente"); // (1) Localizamos el curso en la BDD
  } catch (error) {
    const err = new Error(
      "Ha habido algún problema. No se ha podido actualizar la información del curso"
    );
    err.code = 500;
    throw err;
  }
  // // ! Verificación de usuario
  // if (usuarioBuscar.docente.id.toString() !== req.userData.userId) {
  //   // Verifica que el creador en la BDD sea el mismo que viene en el req. (headers)
  //   const err = new Error("No tiene permiso para modificar este curso");
  //   err.code = 401; // Error de autorización
  //   return next(err);
  // }
  // ? Si existe el curso y el usuario se ha verificado
  try {
    cocheBuscar = await Cliente.findById(idCoche).populate("cliente");
    // ? Bloque si queremos modificar el docente que imparte el curso
    if (req.body.cliente) {
      cocheBuscar.cliente.vehiculos.pull(cocheBuscar); // * Elimina el curso del docente al que se le va a quitar
      await cocheBuscar.cliente.save(); // * Guarda dicho docente
      clienteBuscar = await Cliente.findById(req.body.cliente); // * Localiza el docente a quien se le va a reasignar el curso
      clienteBuscar.vehiculos.push(cocheBuscar); // * Añade al array de cursos del docente el curso que se le quitó al otro docente
      clienteBuscar.save(); // * Guardar el docente con el nuevo curso en su array de cursos
    }
    // ? Si queremos modificar cualquier propiedad del curso, menos el docente.
    cocheBuscar = await Vehiculo.findByIdAndUpdate(idCoche, req.body, {
      new: true,
      runValidators: true,
    }).populate("cliente");
  } catch (err) {
    console.log(err.message);
    const error = new Error(
      "Ha habido algún error. No se han podido modificar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    message: "Curso modificado",
    coche: cocheBuscar,
  });
});
// // * Modificar un curso en base a su id
// router.patch('/:id', async (req, res, next) => {
// 	const idUsuario = req.params.id;
// 	let cursoBuscar;
// 	try {
// 		cursoBuscar = await Curso.findById(idUsuario); // (1) Localizamos el curso en la BDD
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha habido algún problema. No se ha podido actualizar la información del curso'
// 		);
// 		err.code = 500;
// 		throw err;
// 	}
// 	if (cursoBuscar.docente.toString() !== req.userData.userId) {
// 		// Verifica que el creador en la BDD sea el mismo que viene en el req. (headers)
// 		const err = new Error('No tiene permiso para modificar este curso');
// 		err.code = 401; // Error de autorización
// 		return next(err);
// 	}
// 	let cursoSearch;
// 	try {
// 		cursoSearch = await Curso.findByIdAndUpdate(idUsuario, req.body, {
// 			new: true,
// 			runValidators: true,
// 		});
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha ocurrido un error. No se han podido actualizar los datos'
// 		);
// 		err.code = 500;
// 		return next(error);
// 	}
// 	res.status(200).json({
// 		mensaje: 'Curso modificado',
// 		curso: cursoSearch,
// 	});
// });
router.use(checkAuth)
// * Recuperar cursos desde la BDD en Atlas
router.get("/", async (req, res, next) => {
  let vehiculos;
  try {
    vehiculos = await Vehiculo.find({}).populate("cliente");
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los coches",
    vehiculos: vehiculos,
  });
});

// * Recuperar un curso por su Id
router.get("/:id", async (req, res, next) => {
  const idCoche = req.params.id;
  let coche;
  try {
    coche = await Vehiculo.findById(idCoche).populate("coche");
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!coche) {
    const error = new Error(
      "No se ha podido encontrar un curso con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Coche encontrado",
    coche: coche,
  });
});
// * Modificar un curso en base a su id ( y su referencia en docentes)
// * Modificar curso en base a su id - Método alternativo
// router.patch('/:id', async (req, res, next) => {
// 	// const { curso, docente, opcion, aula, precio } = req.body;
// 	const idCoche = req.params.id;
// 	let cursoBuscar;
// 	try {
// 		cursoBuscar = await Curso.findByIdAndUpdate(idUsuario, { precio: 7000 });
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha ocurrido un error. No se han podido actualizar los datos'
// 		);
// 		error.code = 500;
// 		return next(err);
// 	}
// 	res.status(200).json({
// 		mensaje: 'Curso modificado',
// 		curso: cursoBuscar,
// 	});
// });

// * Eliminar un curso en base a su id
// router.delete('/:id', async (req, res, next) => {
// 	let curso;
// 	try {
// 		curso = await Curso.findByIdAndDelete(req.params.id);
// 	} catch (err) {
// 		const error = new Error(
// 			'Ha habido algún error. No se han podido eliminar los datos'
// 		);
// 		error.code = 500;
// 		return next(error);
// 	}
// 	res.json({
// 		message: 'Curso eliminado',
// 		curso: curso,
// 	});
// });

// * Eliminar un curso en base a su id (y el docente relacionado)
router.delete("/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  let coche;
  try {
    coche = await Vehiculo.findById(idUsuario).populate("cliente"); // ? Localizamos el curso en la BDD por su id
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos para eliminación"
    );
    error.code = 500;
    return next(error);
  }
  if (!coche) {
    // ? Si no se ha encontrado ningún curso lanza un mensaje de error y finaliza la ejecución del código
    const error = new Error(
      "No se ha podido encontrar un curso con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }

  // // ! Verificación de usuario
  // if (curso.docente.id.toString() !== req.userData.userId) {
  //   // Verifica que el creador en la BDD sea el mismo que viene en el req. (headers) procedente de checkAuth
  //   const err = new Error("No tiene permiso para eliminar este curso");
  //   err.code = 401; // Error de autorización
  //   return next(err);
  // }

  // ? Si existe el curso y el usuario se ha verificado
  try {
    // ? (1) Eliminar curso de la colección
    await coche.deleteOne();
    // ? (2) En el campo docente del documento curso estará la lista con todos lo cursos de dicho docente. Con el método pull() le decimos a mongoose que elimine el curso también de esa lista.
    coche.cliente.vehiculos.pull(coche);
    await coche.cliente.save(); // ? (3) Guardamos los datos de el campo docente en la colección curso, ya que lo hemos modificado en la línea de código previa
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    message: "Coche eliminado",
  });
});

module.exports = router;
