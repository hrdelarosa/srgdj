### **Contexto del Área:**
El área de **Asuntos Jurídicos** del Instituto Nacional de Migración, en la Oficina de Representación Acapulco, Guerrero. Esta recibe diariamente documentos jurídicos (oficios, amparos, demandas, solicitudes de información, entre otros), los cuales deben de seguir un proceso de seguimiento que varia dependiendo el tipo de documento. 
Estos documentos se organizan físicamente en archivos ordenados por meses, estos normalmente por la fecha en que se recibió dicho documento, así como también suelen estar organizados por el tipo de documento, que a su vez estos se almacenas en archiveros los cuales tienes clasificaciones para tener un orden de estos, por ejemplo por tipo de documento y el año. 

Cada documento que se recibe y se le da el seguimiento adecuado, este al concluir todo este proceso se guarda y al final del mes y al comienzo del nuevo, se archivan todos los oficios que se recibieron en el mes y que se haya concluido todo el proceso de seguimiento, sin embargo pueden surgir situaciones en las cuales se necesite consultar o localizar un documento ya archivado, esto dado que no existe un registro digital en el cual se centralice toda esta información de los documentos, por lo que esta búsqueda  en ocasiones pude volverse muy complicada y tardada, por la gran cantidad de documentos que se cuenta o porque a la hora de la búsqueda se cuenta con muy poca información acerca del documento.

A partir de esta observación del flujo de trabajo, se propone un proyecto de software el cual busca atender las principales zonas de mejoras dentro del área.

### Descripción General
Desarrollo de un sistema centralizado para el registro, consulta y seguimiento de todos los documentos legales que recibe el área de **Asuntos Jurídicos**. El sistema serviría con un registro digital permanente que busca complementar lo que ya se tiene dentro del área, esto como una nueva forma siendo la única fuente de consulta.

Este con un enfoque de escalar hacia una idea mas completa, la cual se pueda implementar en otras áreas las cuales manejen una gran cantidad de documentos y archivos.
### Problema que Resuelve 
La ausencia de un registro estructurado genera varios problemas concretos:
1. **Búsqueda ineficiente de documentos archivados.** Cuando llega un nuevo oficio relacionado con uno ya archivado, o cuando se necesita localizar un documento específico, la búsqueda se realiza directamente en los archivos físicos organizados, muchas veces sin una referencia clara y rápida que indique dónde está.
2. **Recibir el mismo documento 2 veces.** Pueden llegar a dejar un oficio el cual ya fue recibido, pero este nuevo solamente tiene unos cambios y recibirlo puede causar varios problemas que es mejor evitarlos.
3. **Sin trazabilidad del seguimiento.** No hay una forma ágil de saber en qué etapa del proceso se encuentra un documento, como qué acciones ya se realizaron y hasta que fecha se tiene para finalizar con el seguimiento.
4. **Dependencia de memoria o apuntes informales.** La gestión de los documentos y sus procesos asociados queda en el conocimiento individual de las personas del área, lo que representa un riesgo ante rotación de personal.
### Propuesta de Solución
Una plataforma/aplicación web de registros, consultas y seguimiento de documentos jurídicos, esta cuenta con las siguientes características:
#### Registro de documentos 
Cada vez que llegue un documento se deberá de captura la siguiente información de este:

| Campo                               | Descripción                                             |
| ----------------------------------- | ------------------------------------------------------- |
| **No. Oficio**                      | Número oficial del documento                            |
| **No. Expediente**                  | Número de expediente asociado                           |
| **Actor**                           | Nombre de la persona demandante                         |
| **Demandado**                       | Nombre de la persona demandada                          |
| **Tipo de documento**               | Oficio, amparo, demanda, solicitud de información, etc. |
| **Fecha de Oficio**                 | Fecha en que fue emitido el documento                   |
| **Fecha de Recibo**                 | Fecha en que fue recibido por el área                   |
| **Anexos**                          | Indicación de documentos adjuntos                       |
| **Carpeta / Ubicación / Archivero** | Carpeta física o digital donde se archiva               |
| **Estado actual**                   | Etapa en la que se encuentra el documento               |
| **Observaciones**                   | Notas adicionales relevantes                            |
#### Búsqueda y Consulta 
Este tendrá la posibilidad de realizar una búsqueda así como también el poder filtrar los documentos, estas son algunas de las opciones en las que se pueda hacer esto:
- **Búsqueda por cualquier campo:** La búsqueda será posible realizarse por cualquiera de los campos de la tabla anterior.
- **Filtros de Ordenamiento:** Se podrá visualizar la tabla con estos filtros, por lo que esta esta opción de filtro será un complemento para una búsqueda mas sencilla.
- **Exportación:** La posibilidad de exportar estos datos en documentos de Exel o PDF para tener la posibilidad de realizar reportes.
#### Beneficios Esperados
- Mantener un registro de todos los documentos
- Localizar de una manera mas rápida y eficaz cualquier documento, para posterior buscar en el archivo físico exacto, sin la necesidad de estar buscando por varios archivos los cuales no contengan el documento
- Visibilidad del estado del documento
- Historial permanente el cual no dependa únicamente de la memoria del personal
- Base de datos que crece con el tiempo y se vuelve más valiosa con el uso