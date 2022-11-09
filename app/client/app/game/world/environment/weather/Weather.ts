import {
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    InterleavedBufferAttribute,
    Points,
    PointsMaterial,
    Vector2,
} from 'three';
import LoopsManager from '../../../loopsManager/LoopsManager';

export default class Weather {
    static windUniforms = {
        uWindStrength: {
            value: 0,
        },
        uWindDirection: {
            value: new Vector2(1, 0),
        },
    };

    rainVelocity = 2;

    mesh: Points;
    positions: BufferAttribute | InterleavedBufferAttribute;
    constructor() {
        const geometry = new BufferGeometry();
        const material = new PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            opacity: 0.5,
            transparent: true,
            color: 0x7295b0,
        });

        const vertices: number[] = [];

        for (let i = 0; i < 512; i++) {
            const x = 10 * Math.random() - 5;
            const y = 10 * Math.random();
            const z = 10 * Math.random() - 5;

            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.positions = geometry.getAttribute('position');
        this.mesh = new Points(geometry, material);
        LoopsManager.subscribe('update', this.update);
    }

    private update = () => {
        const { positions } = this;
        const windVec = Weather.windUniforms.uWindDirection.value;
        const uWindStrength = Weather.windUniforms.uWindStrength.value;

        for (let i = 0; i < positions.count; i++) {
            const px = positions.getX(i);
            const py = positions.getY(i);
            const pz = positions.getZ(i);

            let nx = px - windVec.x * uWindStrength * 0.05;
            let ny = py - 0.05 * this.rainVelocity;
            let nz = pz - windVec.y * uWindStrength * 0.05;

            if (ny < 0 || nx > 10 || nx < -10 || nz > 10 || nz < -10) {
                nx = 10 * Math.random() - 5 + windVec.x * 2.5 * uWindStrength;
                ny = 5;
                nz = 10 * Math.random() - 5 + windVec.y * 2.5 * uWindStrength;
            }

            positions.setXYZ(i, nx, ny, nz);
        }

        positions.needsUpdate = true;
    };

    getMesh() {
        return this.mesh;
    }
}
