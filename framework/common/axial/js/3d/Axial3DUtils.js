"use strict"

import * as THREE from "three";

class Axial3DUtils
{
    /**
     * 
     * @param { THREE.Vector3 } worldVector 
     * @param { THREE.Camera } camera 
     * @returns { THREE.Vector2 }
     */
    static worldToScreen( worldVector, camera )
    {
        const screenVector = worldVector.project( camera );
        console.log(screenVector);
        
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;

        const screenX = screenCenterX + screenCenterX * screenVector.x;
        const screenY = screenCenterY - screenCenterY * screenVector.y;

        //console.log( screenX );
        //console.log( screenY );

        return new THREE.Vector2(screenX, screenY);
    }

    /**
     * 
     * @param {*} screenVector 
     * @param {*} camera 
     */
    static screenToWorld( screenX, screenY, camera )
    {
        const dw = window.innerWidth / 2;
        const dh = window.innerHeight / 2;

        const nx = ( ( screenX - dw ) / dw );
        const ny = -( ( screenY - dh ) / dh );

        const mouseVector = new THREE.Vector3( nx, ny, -1 ).unproject(camera);
        mouseVector.sub( camera.position ).normalize();

        const distance = -camera.position.z / mouseVector.z;
        const worldVector = new THREE.Vector3().copy(camera.position).add( mouseVector.multiplyScalar(distance) );

        return worldVector;
    }


    /**
     * Return a Vector
     * @param { THREE.Object3D } object3d 
     * @param { THREE.Camera } camera 
     */
    static getObjectSize( object3d, camera )
    {
        const box = new THREE.Box3().setFromObject( object3d, false );
        const worldSize = box.getSize( new THREE.Vector3 );
        const screenSize = worldSize.clone().project( camera );

        const objectWidth = screenSize.x * (window.innerWidth / 2);
        const objectHeight = screenSize.y * (window.innerHeight / 2);

        return new THREE.Vector2(objectWidth, objectHeight);
    }
}

export { Axial3DUtils }