/*Declaracion de variables*/
const fecha = document.querySelector('#fecha');
const lista = document.querySelector('#lista');
const input = document.querySelector('#input');
const botonEnter = document.querySelector('#boton-enter');
const mensaje = document.querySelector('#mensaje');
const stopwatch = document.getElementById('stopwatch');
const playPauseButton = document.getElementById('play-pause');
const secondsSphere = document.getElementById('seconds-sphere');
const boton10Min = document.getElementById('boton-10min');
const boton20Min = document.getElementById('boton-20min');
const boton30Min = document.getElementById('boton-30min');

/* Estilos y Control*/

const check = 'fa-check-circle';
const uncheck = 'fa-circle';
const lineThrough = 'line-through';
let LIST = [];
let id = 0;
let stopwatchInterval;
let runningTime = 0;
let isRunning = false;

/*Funciones y lista de Tareas*/

function mostrarMensaje(texto, duracion = 8000) {
    mensaje.textContent = texto;
    mensaje.classList.add('mensaje-visible');

    setTimeout(() => {
        mensaje.classList.add('fade-out');
        setTimeout(() => {
            mensaje.classList.remove('mensaje-visible', 'fade-out');
        }, 500);
    }, duracion);
}

function esTareaValida(tarea, duracion = 8000) {
    if (!tarea.trim()) {
        mostrarMensaje('Error: La tarea no puede estar vacía');
        return false;
    }

    const existeTarea = LIST.some(item => item.nombre.toLowerCase() === tarea.toLowerCase() && !item.eliminado);
    if (existeTarea) {
        mostrarMensaje('Error: La tarea ya existe');
        return false;
    }

    return true;
}

function agregarTarea(tarea, id, realizado, eliminado) {
    if (eliminado) return;

    const REALIZADO = realizado ? check : uncheck;
    const LINE = realizado ? lineThrough : '';
    const elemento = `
        <li id="elemento">
            <i class="far ${REALIZADO}" data="realizado" id="${id}"></i>
            <p class="text ${LINE}">${tarea}</p>
            <i class="fas fa-trash de" data="eliminado" id="${id}"></i>
        </li>
    `;
    lista.insertAdjacentHTML("beforeend", elemento);
}

function tareaRealizada(element) {
    element.classList.toggle(check);
    element.classList.toggle(uncheck);
    element.parentNode.querySelector('.text').classList.toggle(lineThrough);
    element.parentNode.classList.toggle('realizado');
    LIST[element.id].realizado = !LIST[element.id].realizado;
}

function tareaEliminada(element) {
    const tarea = element.parentNode;
    tarea.classList.add('fade-out-task');
    setTimeout(() => {
        tarea.remove();
    }, 500);

    LIST[element.id].eliminado = true;
    mostrarMensaje('Tarea eliminada');
}

/*Funcion para Manejar la lista de tareas */

function manejarNuevaTarea() {
    const tarea = input.value;
    if (esTareaValida(tarea)) {
        agregarTarea(tarea, id, false, false);
        LIST.push({
            nombre: tarea,
            id: id,
            realizado: false,
            eliminado: false
        });
        localStorage.setItem('TODO', JSON.stringify(LIST));
        localStorage.setItem('TIMESTAMP', Date.now());
        id++;
        input.value = '';
        mostrarMensaje('Tarea agregada con éxito');
    }
}

function limpiarTareas() {
    localStorage.clear();
    lista.innerHTML = '';
    LIST = [];
    id = 0;
}

function verificarInactividad() {
    const timestamp = localStorage.getItem('TIMESTAMP');
    if (timestamp) {
        const ahora = Date.now();
        const diferenciaHoras = (ahora - timestamp) / (1000 * 60 * 60);
        if (diferenciaHoras > 3) {
            limpiarTareas();
            mostrarMensaje('Las tareas han sido eliminadas por inactividad.');
        }
    }
}

function verificarInactividadCronometro() {
    const timestamp = localStorage.getItem('TIMESTAMP');
    const savedTime = localStorage.getItem('RUNNING_TIME');
    const savedIsRunning = localStorage.getItem('IS_RUNNING');
    if (timestamp && runningTime) {
        const ahora = Date.now();
        const diferenciaHoras = (ahora - timestamp) / (1000 * 60 * 60);
        if (diferenciaHoras > 3) {
            stop();
            mostrarMensaje('El cronómetro ha sido reiniciado por inactividad.');
        } else {
            secondsSphere.style.animation = 'rotacion 60s linear infinite';
            let startTime = Date.now() - runningTime;
            secondsSphere.style.animationPlayState = 'running';
            stopwatchInterval = setInterval(() => {
                runningTime = Date.now() - startTime;
                stopwatch.textContent = calculateTime(runningTime);
            }, 1000);
        }
    }
}

function cargarLista(array) {
    array.forEach(item => {
        agregarTarea(item.nombre, item.id, item.realizado, item.eliminado);
    });
}

window.addEventListener('load', () => {
    verificarInactividad();
    let data = localStorage.getItem('TODO');
    if (data) {
        LIST = JSON.parse(data);
        id = LIST.length;
        cargarLista(LIST);
    } else {
        LIST = [];
        id = 0;
    }
});

/*Funcion para el cronometro*/

const playPause = () => {
    if (!isRunning) {
        playPauseButton.classList.add('running');
        start();
        isRunning = true;
    } else {
        playPauseButton.classList.remove('running');
        pause();
        isRunning = false;
    }
}

const pause = () => {
    secondsSphere.style.animationPlayState = 'paused';
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

const stop = () => {
    secondsSphere.style.transform = 'rotate(-90deg) translateX(60px)';
    secondsSphere.style.animation = 'none';
    playPauseButton.classList.remove('running');
    runningTime = 0;
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatch.textContent = '00:00';
    isRunning = false;
}

const start = () => {
    if (!stopwatchInterval) {
        secondsSphere.style.animation = 'rotacion 60s linear infinite';
        let startTime = Date.now() - runningTime;
        secondsSphere.style.animationPlayState = 'running';
        stopwatchInterval = setInterval(() => {
            runningTime = Date.now() - startTime;
            stopwatch.textContent = calculateTime(runningTime);
            localStorage.setItem('RUNNING_TIME', runningTime);
            localStorage.setItem('TIMESTAMP', Date.now());
        }, 1000);
    }
}

const iniciarCuentaRegresiva = (minutos) => {
    const tiempoObjetivo = minutos * 60 * 1000;
    let tiempoRestante = tiempoObjetivo;
    let startTime = Date.now();


    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
    }


    secondsSphere.style.transform = 'rotate(-90deg) translateX(100px)';


    const duracionAnimacion = minutos * 60 + 's';
    secondsSphere.style.animation = `rotacion ${duracionAnimacion} linear infinite`;

    // Iniciar la animación
    secondsSphere.style.animationPlayState = 'running';

    stopwatchInterval = setInterval(() => {
        tiempoRestante = tiempoObjetivo - (Date.now() - startTime);
        stopwatch.textContent = calculateTime(tiempoRestante);
        if (tiempoRestante <= 0) {
            clearInterval(stopwatchInterval);
            stop();
            mostrarNotificacion('¡Tiempo cumplido!');
            audioAlerta.play();
        }
    }, 1000);
}

const calculateTime = runningTime => {
    const total_seconds = Math.floor(runningTime / 1000);
    const total_minutes = Math.floor(total_seconds / 60);

    const display_seconds = (total_seconds % 60).toString().padStart(2, "0");
    const display_minutes = total_minutes.toString().padStart(2, "0");

    return `${display_minutes}:${display_seconds}`
}



/* Funciones auxiliares*/

function autoGuardar() {
    setInterval(() => {
        localStorage.setItem('TODO', JSON.stringify(LIST));
        localStorage.setItem('TIMESTAMP', Date.now());
        console.log("Datos guardados automáticamente.");
    }, 60000);
}

function mostrarNotificacion(mensaje) {
    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio.");
    } else if (Notification.permission === "granted") {
        new Notification(mensaje);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification(mensaje);
            }
        });
    }
}

/*Eventos y listeners*/

window.addEventListener('load', () => {
    verificarInactividad();
    verificarInactividadCronometro();
    autoGuardar();
    limpiarTareas();

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});

botonEnter.addEventListener('click', manejarNuevaTarea);

document.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        manejarNuevaTarea();
    }
});

lista.addEventListener('click', function (event) {
    const element = event.target;
    const elementData = element.attributes.data.value;

    if (elementData === 'realizado') {
        tareaRealizada(element);
    } else if (elementData === 'eliminado') {
        tareaEliminada(element);
    }

    localStorage.setItem('TODO', JSON.stringify(LIST));
});

boton10Min.addEventListener('click', () => iniciarCuentaRegresiva(10));
boton20Min.addEventListener('click', () => iniciarCuentaRegresiva(20));
boton30Min.addEventListener('click', () => iniciarCuentaRegresiva(30));

const audioAlerta = new Audio('Sonido/timer.mp3');

const FECHA = new Date();
fecha.innerHTML = FECHA.toLocaleDateString('es-MX', { weekday: 'long', month: 'short', day: 'numeric' });



//Seguridad 
// Deshabilitar clic derecho
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Deshabilitar F12 (Herramientas de desarrollo)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
        e.preventDefault();
    }else if (e.ctrlKey && e.shiftKey && e.key === 'I') { 
        e.preventDefault();
    } else if (e.ctrlKey && e.shiftKey && e.key === 'J') { 
        e.preventDefault();
    }else if (e.ctrlKey && e.key === 'U') { 
        e.preventDefault();
    }
});