import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_APIKEY;

export async function getDistance(origin, destination) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: origin,
                destinations: destination,
                key: GOOGLE_MAPS_API_KEY
            }
        });

        if (response.data.status === 'OK') {
            return response.data.rows[0].elements[0].distance.value /1000; // Distancia en metros
        } else {
            throw new Error('Error en la respuesta de Google Maps');
        }
    } catch (error) {
        console.error('Error obteniendo la distancia:', error);
        return null;
    }
}


