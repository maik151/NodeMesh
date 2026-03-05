# 🧠 NodeMesh: La Forja Cognitiva Open-Source

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![IndexedDB](https://img.shields.io/badge/Local_First-IndexedDB-4B8BBE?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **NodeMesh** es un entorno de simulación cognitiva y arquitectura de conocimiento diseñado con el rigor de una herramienta para desarrolladores (Dev-Tool). Destruye la "Ilusión de Competencia" forjando verdadera maestría a través del estrés cognitivo y la Inteligencia Artificial.

## ⚠️ El Problema: La Ilusión de Competencia
Leer PDFs, subrayar textos y hacer quizzes de opción múltiple con confeti genera dopamina barata, no conocimiento. Crees que sabes un tema porque te resulta familiar al leerlo, pero tu mente colapsa cuando te exigen aplicarlo, auditarlo o escribirlo desde cero bajo presión.

## 🚀 La Solución: NodeMesh
NodeMesh toma tus conceptos aislados (Nodos) y los somete a un "túnel de viento" algorítmico usando LLMs (Gemini, Claude, DeepSeek). A través de 9 tipos de auditorías diferentes, *Spaced Repetition* (Repetición Espaciada) y la *Taxonomía de Bloom*, te obliga a entrelazar esos datos en una red mental indestructible (Mesh).

---

## 🏛️ Características Principales (Core Features)

* **🔐 Arquitectura Local-First & BYOK (Bring Your Own Key):** NodeMesh no tiene backend. Tu conocimiento y tu API Key (cifrada vía Web Crypto API) viven exclusivamente en la base de datos `IndexedDB` de tu navegador. Cero rastreo, privacidad absoluta y control total de tus créditos de IA.
* **🔬 Auditoría Basada en la Taxonomía de Bloom:** Ajusta el nivel cognitivo del simulador. Pasa de simples pruebas de "Retención" (Junior) a complejas simulaciones de "Auditoría" o "Creación" (Senior).
* **🔄 Técnica Feynman Inversa:** Intercambia roles. El LLM genera código o conceptos con errores sutiles (asumiendo el rol de un Dev Junior) y tú debes encontrar el "bug" lógico.
* **🧠 Motor de Spaced Repetition & Interleaving:** Un algoritmo matemático rastrea tus fallos y agenda las revisiones en el momento exacto en que tu cerebro está a punto de olvidarlos, mezclando dominios para evitar la memoria a corto plazo.
* **⚡ Ecosistema Abierto:** Exporta tus sesiones superadas directamente a **Anki** (.csv) con un solo clic.

---

## ⚙️ Stack Tecnológico

* **Frontend:** Angular 17+ (Strict Mode)
* **Base de Datos:** IndexedDB (gestionada a través de Dexie.js)
* **Estilos:** CSS/SCSS (Dark Mode Nativo, estética Dev-Tool)
* **IA Integration:** Llamadas HTTP directas desde el cliente hacia las APIs de LLMs.
* **Despliegue Recomendado:** Docker + Nginx (Alpine)

---

## 💻 Entorno de Desarrollo (Getting Started)

Dado que NodeMesh es una *Single Page Application* Local-First, no necesitas levantar bases de datos relacionales ni configurar servidores backend.

### 1. Pre-requisitos
* [Node.js](https://nodejs.org/) (v20 LTS o superior)
* [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
* Una API Key válida de Google Gemini o Anthropic Claude (para pruebas locales).

### 2. Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone [https://github.com/maik15/NodeMesh.git](https://github.com/maik15/NodeMesh.git)
cd NodeMesh
npm install

