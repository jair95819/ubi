let map;
let marker;
let watchId;
var permiso_aviso;

let retrieve_position =  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    document.querySelector('span[name="latitud"]').textContent = lat.toFixed(6);
    document.querySelector('span[name="longitud"]').textContent = lng.toFixed(6);

    const nuevaUbicacion = { lat, lng };

    if (!map) {
        map = new google.maps.Map(document.getElementById("mapa"), {
            center: nuevaUbicacion,
            zoom: 25
        });

        marker = new google.maps.Marker({
            position: nuevaUbicacion,
            map: map,
            title: "Tu ubicación"
        });
    } else{
        map.setCenter(nuevaUbicacion);
        marker.setPosition(nuevaUbicacion);
    }

    obtenerDireccion(lat, lng);
}

async function verificarPermisoUbicacion() {
    try {
        let permiso = await navigator.permissions.query({ name: "geolocation" });
        
        console.log(permiso.state);
        if (permiso.state === "prompt") {
            permiso_aviso = "Para obtener tu ubicación, permite el acceso a la misma.";
        }

        if (permiso.state === "denied") {
            permiso_aviso = "Has denegado los permisos de ubicación. Ve a Ajustes > Privacidad > Ubicación y actívalos.";
        }
    } catch (error) {
        console.error("Error verificando permisos de ubicación:", error);
    }
}


window.inicializarMapa = async function() {

    verificarPermisoUbicacion();

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(retrieve_position);
        rastrearUbicacion();
    }

}

function rastrearUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(retrieve_position,
            (error) => {
                console.error("Error obteniendo ubicación:", error);
                let mensajeError = "";
                console.log(error.code);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensajeError = "Permiso denegado. Habilita la ubicación en tu navegador." + " " + permiso_aviso;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensajeError = "Ubicación no disponible.";
                        break;
                    case error.TIMEOUT:
                        mensajeError = "Tiempo de espera agotado. Intenta nuevamente.";
                        break;
                    default:
                        mensajeError = "Error desconocido.";
                        break;
                }

                document.getElementById("lugar-actual-direccion").textContent = mensajeError;
            },
            {
                enableHighAccuracy: true, // Usa GPS si está disponible
                timeout: 30000, // Esperar hasta 30s antes de error por timeout
                maximumAge: 0 // No usar caché, siempre solicitar nueva ubicación
            }
        );
    } else {
        alert("Geolocalización no soportada en este navegador.");
    }
}

function obtenerDireccion(lat, lng) {
    const apiKey = "AIzaSyAJ9B6zo3VWRFhnGkJjs9i7ZZg7i0ByP9I"; // Reemplaza con tu API Key de Google
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "OK") {
                const direccion = data.results[0].formatted_address;
                document.getElementById("lugar-actual-direccion").textContent = direccion;
            } else {
                document.getElementById("lugar-actual-direccion").textContent = "Dirección no encontrada";
            }
        })
        .catch((error) => {
            console.error("Error obteniendo la dirección:", error);
        });
}
