"use client";

import React, { useRef, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import { formatPhone } from "@/app/utils/formatPhone";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
// ✅ Tipo de datos del formulario
interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  edad: number;
  zip: string;
  supermercado: string;
  acepta: boolean;
}

const inputStyles = {
  "& label.Mui-focused": {
    color: "#fc0680",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#fc0680",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fc0680",
    },
  },
};

export default function ApplicationForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await fetch("https://sheetdb.io/api/v1/5rnrmuhqeq1h4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      await MySwal.fire({
        title: "¡Solicitud enviada!",
        text: "Gracias por participar. Te contactaremos pronto.",
        icon: "success",
        confirmButtonColor: "#fc0680",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "rounded-xl",
          title: "font-bold text-lg",
          confirmButton: "px-4 py-2",
        },
      });

      reset();
    } catch (err) {
      console.error(err);
      await MySwal.fire({
        title: "Error",
        text: "Hubo un problema al enviar tu solicitud. Inténtalo más tarde.",
        icon: "error",
        confirmButtonColor: "#fc0680",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "rounded-xl",
          title: "font-bold text-lg",
          confirmButton: "px-4 py-2",
        },
      });
    }
  };

  return (
    <Box
      ref={formRef}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: "100%",
        maxWidth: 420,
        mx: "auto",
        p: isMobile ? 2 : 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h6"
        align="center"
        fontWeight="bold"
        color="#fc0680"
        textTransform="uppercase"
        sx={{ fontFamily: "Roboto, sans-serif" }}
      >
        Formulario de Aplicación
      </Typography>

      <TextField
        label="Nombre"
        {...register("nombre", {
          required: "El nombre es obligatorio",
          pattern: {
            value: /^[A-Za-zÁ-ú\s]+$/,
            message: "Solo letras permitidas",
          },
        })}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Apellido"
        {...register("apellido", {
          required: "El apellido es obligatorio",
          pattern: {
            value: /^[A-Za-zÁ-ú\s]+$/,
            message: "Solo letras permitidas",
          },
        })}
        error={!!errors.apellido}
        helperText={errors.apellido?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Teléfono"
        {...register("telefono", {
          required: "El teléfono es obligatorio",
          pattern: {
            value: /^\(\d{3}\) \d{3}-\d{4}$/, // este patrón valida solo los dígitos
            message: "Teléfono inválido",
          },
          onChange: (e) => {
            const rawValue = e.target.value;
            const formatted = formatPhone(rawValue);
            setValue("telefono", formatted); // actualiza el valor del input con formato
          },
        })}
        error={!!errors.telefono}
        helperText={errors.telefono?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Correo electrónico"
        type="email"
        {...register("correo", {
          required: "El correo es obligatorio",
          pattern: {
            value: /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/,
            message: "Correo inválido",
          },
        })}
        error={!!errors.correo}
        helperText={errors.correo?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Edad"
        type="number"
        inputProps={{ min: 18 }}
        {...register("edad", {
          required: "La edad es obligatoria",
          min: { value: 18, message: "Debe ser mayor de edad" },
        })}
        error={!!errors.edad}
        helperText={errors.edad?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Código ZIP"
        {...register("zip", {
          required: "El código ZIP es obligatorio",
        })}
        error={!!errors.zip}
        helperText={errors.zip?.message}
        fullWidth
        sx={inputStyles}
      />

      <TextField
        label="Supermercado donde compra"
        {...register("supermercado", {
          required: "Este campo es obligatorio",
        })}
        error={!!errors.supermercado}
        helperText={errors.supermercado?.message}
        fullWidth
        sx={inputStyles}
      />

      <FormControlLabel
        control={
          <Checkbox
            {...register("acepta", { required: true })}
            color="primary"
            sx={{
              color: "#fc0680",
              "&.Mui-checked": {
                color: "#fc0680",
              },
            }}
          />
        }
        label="He leído y acepto los términos del programa."
      />
      {errors.acepta && (
        <Typography variant="caption" color="error">
          Debes aceptar los términos
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          mt: 1,
          backgroundColor: "#fc0680",
          color: "white",
          fontWeight: "bold",
          borderRadius: "25px",
          py: 1.5,
          fontSize: "1rem",
          "&:hover": {
            backgroundColor: "#e50575",
          },
        }}
      >
        Enviar mi solicitud
      </Button>
    </Box>
  );
}
