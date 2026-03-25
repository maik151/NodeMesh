Design Specifications: NodeMesh Visual System
1. Concepto: "The Modern Forge"
NodeMesh no es solo una consola; es una interfaz de alto rendimiento que combina la claridad de una Dev-Tool con la profundidad visual del Glassmorphism.

Filosofía: Fricción positiva a través de la claridad.

Estilos Base: Soporte dual para Box-Model Estricto (Minimalismo técnico) y Liquid Glass (Modo inmersivo).

2. Paleta de Colores (The Atomic Palette)
Basado en el isotipo y las paletas de referencia de las imágenes

2.1 Colores Primarios (The Node Greens)
Tono,Hexadecimal,Uso
Deep Forge,#0B4D22,Fondos de acento profundos.
Active Node,#9ACD32,Color principal de marca (Logo).
Terminal Glow,#C5E100,"Alertas, estados de éxito y resaltado."

2.2 Escala de Grises y Fondos (The Void)
Tono,Hexadecimal,Uso
Void Black,#050505,Fondo principal de la aplicación.
Slate Surface,#121212,Tarjetas y superficies base.
Glass Border,#ffffff1a,Bordes semi-transparentes para efectos Glass.

2.3 Degradados (Gradients)
Primary Glow: De #9ACD32 a #C5E100 (Ángulo 135°).

Background Depth: Radial de #121212 a #050505.

3. Tipografía (Humanist Terminal)
Buscamos la legibilidad de una interfaz moderna con el alma de una terminal.

Principal (UI/Lectura): "Inter" o "Poppins". Proporciona una curva suave y profesional para usuarios generales.

Mono (Datos/Código): "Fira Code" o "JetBrains Mono". Se utiliza exclusivamente para prompts, bloques de código y métricas técnicas.

Regla de Oro: Títulos en Sans-Serif (Inter), Datos variables en Mono.

4. Componentes y Estilos de Capa
4.1 Liquid Glass (Default Login/Modals)
Efecto: backdrop-filter: blur(12px).

Opacidad: Fondo oscuro al 60% (rgba(18, 18, 18, 0.6)).

Borde: 1px sólido con 10% de opacidad blanca para definir el límite del cristal.

4.2 Botones y Acciones
Iconografía: Uso estricto de Material Symbols (Rounded). Se deben importar como fuente para evitar la mutabilidad de los archivos SVG individuales.

Primary Button: Fondo Active Node, texto Void Black, radio de borde 8px (No circular para mantener el rigor).

5. Variaciones Modos Claros (Light Mode)
Los botones de acción positiva (ej. Cargar Quiz) adaptan su saturación. Se emplea un fondo inspirado en Active Node translucido (`rgba(154, 205, 50, 0.15)`) con texto/bordes en un verde hierba vibrante (`#558b2f`) para mantener contraste visual sin verse manchado u oscuro.

5. Iconografía Definida
Para garantizar que los iconos no cambien, se establece el set de Material Design:

login, account_circle: Autenticación.

terminal, psychology: La Forja / Simulador.

database, security: Bóveda y API Keys.