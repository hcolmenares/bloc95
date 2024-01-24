// Variables
const editor = document.getElementById('editor');

document.addEventListener('DOMContentLoaded', init);

function init() {
    editor.value = '';

    // Make the DIV element draggable:
    dragElement(document.getElementById("bloc"));
}

function checkMobile() {
    // Verificar si el usuario está en un dispositivo móvil
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        // Si es un dispositivo móvil, mostrar un mensaje
        const titulo = 'Advertencia';
        const texto = 'Algunas funcionalidades podrían verse limitadas en dispositivos móviles. Se recomienda ver el Changelog';
        showMessage(titulo, texto);
    }
}

function createNotification(title, message, buttons, input = false, type = 'text', value = null) {
    return new Promise((resolve) => {

        // Create notification container
        const notificationContainer = document.createElement('div');
        const inputElement = document.createElement('input');
        notificationContainer.classList.add('notification', 'win-border');

        // Create title element
        const titleElement = document.createElement('div');
        titleElement.classList.add('notification-title');
        titleElement.textContent = title;
        notificationContainer.appendChild(titleElement);

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.innerHTML = message;
        notificationContainer.appendChild(messageElement);

        // Create input field if needed
        if (input) {
            inputElement.type = type; // You can modify this based on your requirements
            type == 'text' ? inputElement.value = 'Texto' : null;
            if (type == 'number') {
                inputElement.value = 5;
                inputElement.setAttribute('min', 1);
                inputElement.setAttribute('max', 30);
            }
            inputElement.classList.add('notification-input');
            notificationContainer.appendChild(inputElement);
        }

        // Create buttons
        if (buttons && buttons.length > 0) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('notification-buttons');

            buttons.forEach((button) => {
                const buttonElement = document.createElement('button');
                buttonElement.classList.add('notification-button', 'win-border');
                buttonElement.textContent = button.text;

                buttonElement.addEventListener('click', () => {
                    if (input) {
                        const inputValue = inputElement.value;
                        resolve({ buttonValue: button.value, inputValue });
                    } else {
                        resolve({ buttonValue: button.value });
                    }
                    document.body.removeChild(notificationContainer);
                });

                buttonContainer.appendChild(buttonElement);
            });

            notificationContainer.appendChild(buttonContainer);
        }

        // Append notification to the body
        document.body.appendChild(notificationContainer);

        // Show notification
        notificationContainer.style.display = 'block';
    });
}

function showMessage(title = '', texto = '') {
    createNotification(
        title,
        texto,
        [
            { text: 'Aceptar', value: true }
        ]
    );
}

function changeSize() {
    const window = document.getElementById("bloc");
    const windowState = window.classList.contains("medium-size");
    if (windowState) {
        sizeBtn.innerHTML = "❏";
        window.classList.replace("medium-size", "full-size");
        window.style.top = "0";
        window.style.left = "0";
    } else {
        sizeBtn.innerHTML = "□";
        window.classList.replace("full-size", "medium-size");
    }
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (document.getElementById(elmnt.id + "-header")) {
        // If present, the header is where you move the DIV from:
        if (isMobile) {
            // For mobile devices, use touch events
            document.getElementById(elmnt.id + "-header").ontouchstart = dragTouchStart;
        } else {
            // For non-mobile devices, use mouse events
            document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
        }
    } else {
        // Otherwise, move the DIV from anywhere inside the DIV:
        if (isMobile) {
            // For mobile devices, use touch events
            elmnt.ontouchstart = dragTouchStart;
        } else {
            // For non-mobile devices, use mouse events
            elmnt.onmousedown = dragMouseDown;
        }
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the touch position at startup:
        var touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.ontouchend = closeDragElement;
        // Call a function whenever the touch position changes:
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position:
        pos1 = pos3 - (isMobile ? e.touches[0].clientX : e.clientX);
        pos2 = pos4 - (isMobile ? e.touches[0].clientY : e.clientY);
        pos3 = isMobile ? e.touches[0].clientX : e.clientX;
        pos4 = isMobile ? e.touches[0].clientY : e.clientY;
        // Set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Stop moving when the mouse button or touch is released:
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}

function newFile() {
    createNotification(
        'Nuevo Lienzo',
        '¿Desea guardar el lienzo actual?',
        [
            { text: 'Si', value: 'si' },
            { text: 'No', value: 'no' },
            { text: 'Cancelar', value: 'cancelar' }
        ])
        .then((result) => {
            switch (result.buttonValue) {
                case 'si':
                    saveFile().then(() => {
                        // Manejar el éxito
                        editor.value = '';
                    })
                    .catch((error) => {
                        // Manejar errores o cancelaciones
                        console.error(error);
                    });
                    return;
                case 'no':
                    editor.value = '';
                    return;
                case 'cancelar':
                    return
                default:
                    return
            }

        });
}

function uploadFile() {
    // Pregunta al usuario la URL de la imagen
    createNotification(
        'Cargar Imagen',
        'Ingrese la URL de la imagen:',
        [
            { text: 'Cargar', value: true },
            { text: 'Cancelar', value: false }
        ],
        true, // Habilita el campo de entrada
        'file'
    )
        .then((result) => {
            if (result.buttonValue && result.inputValue) {
                return console.log('Upload file');
            }
        });
}

function saveFile() {
    return new Promise((resolve, reject) => {
        createNotification(
            'Guardar lienzo',
            'Ingrese el nombre del archivo:',
            [
                { text: 'Guardar', value: true },
                { text: 'Cancelar', value: false }
            ],
            true // Habilita el campo de entrada
        )
        .then((result) => {
            if (result.buttonValue && result.inputValue) {
                const content = editor.value;
                const blob = new Blob([content], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = result.inputValue + '.txt';
                a.click();
                resolve(); // Resuelve la promesa si todo es exitoso
            } else {
                reject(new Error('Cancelado')); // Rechaza la promesa si se cancela
            }
        })
        .catch((error) => {
            reject(error); // Rechaza la promesa en caso de error
        });
    });
}

function handleSaveFile() {
    saveFile()
        .then(() => {
            return;
        })
        .catch((error) => {
            console.error(error);
            return;
        });
}

function infoBloc() {
    createNotification(
        'Acerca de PaintPSA',
        `¡Sea usted bienvenid@ a BlocSPA!<br><br>
        Actualmente este es un proyecto para tratar de recrear
        la experiencia de Paint de Windows95 en una página web.<br><br>
        Desarrollado por Hugo Colmenares.<br>`,
        [
            { text: 'Aceptar', value: true }
        ]
    );
}

function closeBloc() {
    const window = document.getElementById("bloc");
    window.style.display = 'none';
}