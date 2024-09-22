const fecha = document.querySelector('#fecha');
const lista = document.querySelector('#lista');
const input = document.querySelector('#input');
const botonEnter = document.querySelector('#boton-enter');
const mensaje = document.querySelector('#mensaje');
const check = 'fa-check-circle';
const uncheck = 'fa-circle';
const lineThrough = 'line-through';
let LIST;
let id = 0;


const FECHA = new Date();
fecha.innerHTML = FECHA.toLocaleDateString('es-MX', { weekday: 'long', month: 'short', day: 'numeric' });


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
    element.parentNode.parentNode.removeChild(element.parentNode);
    LIST[element.id].eliminado = true;
    mostrarMensaje('Tarea eliminada');
}


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

window.addEventListener('load', limpiarTareas);

let data = localStorage.getItem('TODO');
if (data) {
    LIST = JSON.parse(data);
    id = LIST.length;
    cargarLista(LIST);
} else {
    LIST = [];
    id = 0;
}

function cargarLista(array) {
    array.forEach(item => {
        agregarTarea(item.nombre, item.id, item.realizado, item.eliminado);
    });
}