class Panel {
    constructor(scene, x, y, z, size) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.red = Math.round(Math.random() * 255);
        this.green = Math.round(Math.random() * 255);
        this.blue = Math.round(Math.random() * 255);

        var geometry = new THREE.BoxGeometry( this.size, 0.05, this.size);
        var material = new THREE.MeshBasicMaterial( { color: `rgb(${this.red},${this.green},${this.blue})` } );
        this.cube = new THREE.Mesh( geometry, material );
        this.scene.add( this.cube );
        this.cube.position.set(this.x, this.z, this.y);
    }
    setColor(red, green, blue, opacity, playSpeed) {
        this.red = Math.round(red);
        this.green = Math.round(green);
        this.blue = Math.round(blue);

        this.cube.material.color = new THREE.Color(`rgb(${this.red},${this.green},${this.blue})`)
    }
    load(values, playSpeed) {
        this.setColor(values[0], values[1], values[2], values[3], playSpeed);
    }

}


module.exports = Panel;
