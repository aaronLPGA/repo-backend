
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Importación de librería
const jwt = require("jsonwebtoken");

const Cliente = require("../models-clients/models-clients");

// * Listar todos los clientes
router.get("/", async (req, res, next) => {
  let clientes;
  try {
    clientes = await Cliente.find({}, "password");
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los clientes",
    clientes: clientes,
  });
});

// * Listar un cliente en concreto
router.get("/:id", async (req, res, next) => {
  const idCliente = req.params.id;
  let cliente;
  try {
    cliente = await Cliente.findById(idCliente);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!cliente) {
    const error = new Error(
      "No se ha podido encontrar un docente con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Cliente encontrado",
    cliente: cliente,
  });
});

router.get("/:id/plaza",async(req,res,next) => {

  const idCliente = req.params.id;
  let plaza;
  try {
    plaza = await Cliente.findById(idCliente.plaza);
    console.log(plaza)
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!plaza) {
    const error = new Error(
      "No se ha podido encontrar una plaza con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Cliente encontrado",
    plaza: plaza,
  });
});



// // * Crear nuevo docente
// router.post("/", async (req, res, next) => {
//   const { nombre, email, password, dni, plaza } = req.body;
//   let existeCliente;
//   try {
//     existeCliente = await Cliente.findOne({
//       email: email
      
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.code = 500;
//     return next(error);
//   }

//   if (existeCliente) {
//     const error = new Error("Ya existe un cliente con ese e-mail.");
//     error.code = 401; // ! 401: fallo de autenticación
//     return next(error);
//     // ! ATENCIÓN: FIJARSE EN DONDE EMPIEZA Y TERMINA ESTE ELSE
//   } else {
//     // ? Encriptación de password mediante bcrypt y salt
//     let hashedPassword;
//     try {
//       hashedPassword = await bcrypt.hash(password, 12); // ? Método que produce la encriptación
//     } catch (error) {
//       const err = new Error(
//         "No se ha podido crear el docente. Inténtelo de nuevo"
//       );
//       err.code = 500;
//       console.log(error.message);
//       return next(err);
//     }

//     const nuevoCliente = new Cliente({
//       nombre,
//       email,
//       password: hashedPassword, // ? La nueva password será la encriptada
//       vehiculos: [],
//       dni,
//       plaza
//     });

//     try {
//       await nuevoCliente.save();
//     } catch (error) {
//       const err = new Error("No se han podido guardar los datos");
//       err.code = 500;
//       return next(err);
//     }
//     // ? Código para la creación del token
//     try {
//       token = jwt.sign(
//         {
//           userId: nuevoCliente.id,
//           email: nuevoCliente.email,
//         },
//         "clave_supermegasecreta",
//         {
//           expiresIn: "1h",
//         }
//       );
//     } catch (error) {
//       const err = new Error("El proceso de alta ha fallado");
//       err.code = 500;
//       return next(err);
//     }
//     res.status(201).json({
//       userId: nuevoCliente.id,
//       email: nuevoCliente.email,
//       token: token,
//     });
//   }
// });

router.post("/", async (req, res, next) => {
  const { nombre, email, password, dni, plaza } = req.body;
  let existePlaza;
  try {
    existePlaza = await Cliente.findOne({
      plaza: plaza
      
    });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  if (existePlaza) {
    const error = new Error("Ya existe un cliente con esa plaza.");
    error.code = 401; // ! 401: fallo de autenticación
    return next(error);
    // ! ATENCIÓN: FIJARSE EN DONDE EMPIEZA Y TERMINA ESTE ELSE
  } else {
    // ? Encriptación de password mediante bcrypt y salt
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12); // ? Método que produce la encriptación
    } catch (error) {
      const err = new Error(
        "No se ha podido crear el docente. Inténtelo de nuevo"
      );
      err.code = 500;
      console.log(error.message);
      return next(err);
    }

    const nuevoCliente = new Cliente({
      nombre,
      email,
      password: hashedPassword, // ? La nueva password será la encriptada
      vehiculos: [],
      dni,
      plaza,
    });

    try {
      await nuevoCliente.save();
    } catch (error) {
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next(err);
    }
    // ? Código para la creación del token
    try {
      token = jwt.sign(
        {
          userId: nuevoCliente.id,
          email: nuevoCliente.email,
        },
        "clave_supermegasecreta",
        {
          expiresIn: "1h",
        }
      );
    } catch (error) {
      const err = new Error("El proceso de alta ha fallado");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      userId: nuevoCliente.id,
      plaza: nuevoCliente.plaza,
      token: token,
    });
  }
});


// router.post("/", async (req, res, next) => {
//   const { nombre, email, password, dni,vehiculos } = req.body;
//   let existeCliente;
//   try {
//     existeCliente = await Cliente.findOne({
//       email: email,
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.code = 500;
//     return next(error);
//   }

//   if (existeCliente) {
//     const error = new Error("Ya existe un docente con ese e-mail.");
//     error.code = 401; // 401: fallo de autenticación
//     return next(error);
//   } else {
//     const nuevoCliente = new Cliente({
//       nombre,
//       email,
//       password,
//       dni,
//      vehiculos,
      
//     });
    // try {
    //   await nuevoCliente.save();
    // } catch (error) {
    //   const err = new Error("No se han podido guardar los datos");
    //   err.code = 500;
    //   return next(err);
    // }
    // res.status(201).json({
    //   cliente: nuevoCliente,
    // });
//   }
// });

// * Crear nuevo cliente (relacionándolo con Vehiculo)
router.post('/', async (req, res, next) => {
	const { nombre, email, password, dni,plaza } = req.body;
	let existeCliente;
	try {
		existeCliente = await Cliente.findOne({
			email: email,
		});
	} catch (err) {
		const error = new Error(err);
		error.code = 500;
		return next(error);
	}

	if (existeCliente) {
		const error = new Error('Ya existe un docente con ese e-mail.');
		error.code = 401; // 401: fallo de autenticación
		return next(error);
	} else {
		const nuevoCliente = new Cliente({
			nombre,
			email,
			password,
			dni,
      plaza,
			vehiculos: [],
		});
		try {
			await nuevoCliente.save();
		} catch (error) {
			const err = new Error('No se han podido guardar los datos');
			err.code = 500;
			return next(err);
		}
		res.status(201).json({
			cliente: nuevoCliente,
		});
	}
});

// * Modificar datos de un cliente
// router.patch('/:id', async (req, res, next) => {
// 	const { nombre, email, password, cursos, activo } = req.body; // ! Recordar: Destructuring del objeto req.body
// 	const idcliente = req.params.id;
// 	let clienteBuscar;
// 	try {
// 		clienteBuscar = await cliente.findById(idcliente); // (1) Localizamos el cliente en la BDD
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha habido algún problema. No se ha podido actualizar la información del cliente'
// 		);
// 		err.code = 500;
// 		throw err;
// 	}

// 	// (2) Modificamos el cliente
// 	clienteBuscar.nombre = nombre;
// 	clienteBuscar.email = email;
// 	clienteBuscar.password = password;
// 	clienteBuscar.cursos = cursos;
// 	clienteBuscar.activo = activo;

// 	try {
// 		clienteBuscar.save(); // (3) Guardamos los datos del docente en la BDD
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha habido algún problema. No se ha podido guardar la información actualizada'
// 		);
// 		err.code = 500;
// 		throw err;
// 	}
// 	res.status(200).json({
// 		mensaje: 'Datos de docente modificados',
// 		docente: clienteBuscar,
// 	});
// });

// * Modificar datos de un cliente - Método más efectivo (findByIdAndUpadate)
router.patch("/:id", async (req, res, next) => {
  const idCliente = req.params.id;
  const camposPorCambiar = req.body;
  let clienteBuscar;
  try {
    clienteBuscar = await Cliente.findByIdAndUpdate(
      idCliente,
      camposPorCambiar,
      {
        new: true,
        runValidators: true,
      }
    ); // (1) Localizamos y actualizamos a la vez el cliente en la BDD
  } catch (error) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos del cliente",
      error: error.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de cliente modificados",
    cliente: clienteBuscar,
  });
});

// * Eliminar un cliente
router.delete("/:id", async (req, res, next) => {
  let cliente;
  try {
    cliente = await Cliente.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "cliente eliminado",
    cliente: cliente,
  });
});

// * Login de clientes
router.post("/login", async (req, res, next) => {
  const { email, password,plaza } = req.body;
  let clienteExiste;
  try {
    clienteExiste = await Cliente.findOne({
      // ? (1) Comprobación de email
      email: email,
    });
  } catch (error) {
    const err = new Error(
      "No se ha podido realizar la operación. Pruebe más tarde"
    );
    err.code = 500;
    return next(err);
  }
  // ? ¿Qué pasa si el docente no existe?
  if (!clienteExiste) {
    const error = new Error(
      "No se ha podido identificar al docente. Credenciales erróneos 2"
    );
    error.code = 422; // ! 422: Datos de usuario inválidos
    return next(error);
  }
  // ? Si existe el docente, ahora toca comprobar las contraseñas.
  let esValidoElPassword = false;
  esValidoElPassword = bcrypt.compareSync(password, clienteExiste.password);
  if (!esValidoElPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos"
    );
    error.code = 401; // !401: Fallo de autenticación
    return next(error);
  }
  // ? Docente con los credeciales correctos.
  // ? Creamos ahora el token
  // ! CREACIÓN DEL TOKEN
  let token;
  try {
    token = jwt.sign(
      {
        userId: clienteExiste.id,
        email: clienteExiste.email,
      },
      "secret_password",
      {
        expiresIn: "1h",
      }
    );
    
   if(!clienteExiste.plaza.includes(plaza)){
    const error = new Error(
      "No se ha tiene la plaza correcta. Credenciales erróneos"
    );
    error.code = 401; // !401: Fallo de autenticación
    return next(error);
   }
  } catch (error) {
    const err = new Error("El proceso de login ha fallado");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    mensaje: "Cliente ha entrado con éxito en el sistema",
    userId: clienteExiste.id,
    email: clienteExiste.email,
    token: token,
  });
});

// * Buscar un docente en función del parámetro de búsqueda
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let clientes;
  try {
    clientes = await Cliente.find({
      nombre: { $regex: search, $options: "i" },
    });
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({ mensaje: "Clientes encontrados", clientes: clientes });
});

module.exports = router;
