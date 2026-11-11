## Módulo de RRHH (Bloque 7)

### Control de Asistencia (Fichaje)
- **Configurable**: Soporte para múltiples métodos de fichaje: PIN/Tarjeta en POS o Tablet, App móvil con validación GPS, o integración con relojes biométricos (huella/rostro).
- **Tolerancias**: Configuración de márgenes de tardanza y horas extras.

### Liquidación de Sueldos (Nómina)
- **Cálculo de variables interno**: El sistema calcula horas, extras, comisiones, propinas y descuentos por consumo (Meal Comp).
- **Integración externa**: Exportación del pre-libro de sueldos vía archivo o API a sistemas de nómina locales o estudios contables (para el cálculo impositivo y legal final).
- **Portal del empleado**: Recibe y visualiza el recibo oficial importado desde el sistema externo.

### Comisiones y Distribución de Propinas
- **Configurable**: El dueño define las reglas de reparto (100% al mozo, o bolsillo compartido por turno/sucursal).
- **Cálculo automático**: Distribución de propinas según porcentajes o puntajes por rol (mozos, cocina, bacheros).
- **Integración**: El monto liquidado se envía al pre-libro de sueldos.

### Vacaciones y Licencias
- **Configurable**: Permite el flujo de autogestión (el empleado solicita desde su app y el superior aprueba) o la carga administrativa directa desde el panel de RRHH.
- **Control de saldos**: Cálculo automático de días disponibles según antigüedad y normativa del país.

### Portal del Empleado (Dashboard Personalizado)
- **Vista adaptada al rol**: Pantalla de inicio con accesos directos según el puesto (Mozo, Gerente, Admin).
- **Módulos internos**: Mi Jornada (horarios, fichaje, tareas), Mi Economía (recibos, propinas, consumos) y Mi Perfil (documentación, solicitudes).

### Planificación de Turnos (Scheduling)
- **Configurable**: Permite armado manual (arrastrar y soltar) o sugerencia automática por IA (basada en forecast de ventas y disponibilidad del personal).
- **Asignación de roles**: Control de cobertura por puesto (ej. mínimo 2 mozos y 1 cajero por turno).

### Salud y Seguridad Ocupacional (SST)
- **Configurable**: Permite un registro básico de incidentes o habilitar un módulo completo (checklists de EPP con firma digital, investigación de accidentes, alertas de exámenes médicos).

### Reclutamiento y Selección (ATS)
- **Configurable**: Permite activar un módulo ATS completo (recepción de CVs, seguimiento de entrevistas, conversión a empleado) o utilizarlo solo para la carga de legajos de personal ya contratado por fuera.

### Capacitaciones y Certificaciones
- **Repositorio simple**: Solo almacena el archivo (PDF/foto) del certificado, su fecha de vencimiento y el empleado asociado.
- **Alertas automáticas**: El sistema notifica al empleado y a RRHH cuando una habilitación está por vencer para que la renueven por fuera.

### Evaluaciones de Desempeño
- **Configurable**: El administrador puede crear plantillas de evaluación personalizadas (escalas de puntuación, competencias, comentarios de texto libre).
- **Historial**: Registro de evaluaciones pasadas para medir la evolución del empleado.

### Egreso de Personal (Offboarding)
- **Configurable**: Permite ejecutar una baja lógica simple (desactivar acceso) o un flujo formal con checklist de devoluciones (llaves, uniformes, equipos) y cálculo de liquidación final.

### Legajo Digital
- **Configurable**: Permite definir qué documentos son obligatorios para completar el legajo.
- **Repositorio estructurado**: Almacenamiento de documentos (DNI, contratos, títulos) con control de vencimientos y firma digital.

### Adelantos y Préstamos
- **Configurable**: Permite llevar un módulo formal de préstamos (con saldo, cuotas y descuento automático en el pre-libro de sueldos) o gestionarlos manualmente por fuera del sistema.

### Horas Extras, Feriados y Recargos
- **Híbrido**: Plantillas preconfiguradas con porcentajes por defecto según el país, pero con la opción de que el administrador modifique los valores para adaptarse a convenios colectivos o reglas internas.

### Análisis de Costo Laboral
- **Configurable**: Permite generar reportes de costo laboral vs. ventas de forma mensual (visión macro) o en tiempo real por turno/sucursal (visión micro).
- **Alertas de desvío**: Notificación si el porcentaje de mano de obra supera el límite saludable definido por el dueño.

### Rotación y Ausentismo (Turnover)
- **Configurable**: Generación de métricas de rotación (altas y bajas) y ausentismo (faltas justificadas/injustificadas) para análisis gerencial, activable según necesidad del dueño.

