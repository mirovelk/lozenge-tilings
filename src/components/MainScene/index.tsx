import { css } from '@emotion/react';
import { Paper } from '@mui/material';
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Vector3Tuple } from 'three';
import {
  selectPeriodBoxCount,
  selectVoxelPositions,
} from '../../redux/features/lozengeTiling/lozengeTilingSlice';
import { useAppSelector } from '../../redux/store';
import edgeRed from './edgeRed.png';
import edgeBlue from './edgeBlue.png';

const boxTextureRed = new THREE.TextureLoader().load(edgeRed);
const boxTextureBlue = new THREE.TextureLoader().load(edgeBlue);

const voxelSize = 50;

function alignToGrid(
  position: [number, number, number]
): [number, number, number] {
  return [
    voxelSize * position[0] + voxelSize / 2,
    voxelSize * position[1] + voxelSize / 2,
    voxelSize * position[2] + voxelSize / 2,
  ];
}

const helpersSize = 10000;

function VoxelInstances({
  voxels,
  map,
  transparent = false,
}: {
  voxels: Vector3Tuple[];
  map: THREE.Texture;
  transparent?: boolean;
}) {
  const boxInstancedMeshRef: React.Ref<
    THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
  > | null = useRef(null);

  useEffect(() => {
    if (boxInstancedMeshRef.current) {
      const matrix = new THREE.Matrix4();
      // Set positions
      for (let i = 0; i < voxels.length; i++) {
        matrix.setPosition(...alignToGrid(voxels[i]));
        boxInstancedMeshRef?.current?.setMatrixAt(i, matrix);
      }
      // Update the instance
      boxInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [voxels]);

  return (
    <>
      <instancedMesh
        ref={boxInstancedMeshRef}
        args={[undefined, undefined, voxels.length]}
      >
        <boxBufferGeometry args={[voxelSize, voxelSize, voxelSize]} />
        <meshStandardMaterial
          map={map}
          opacity={0.8}
          transparent={transparent}
        />
      </instancedMesh>
    </>
  );
}

function MainScene() {
  const { walls, boxes } = useAppSelector(selectVoxelPositions);

  const totalBoxCount = useAppSelector(selectPeriodBoxCount);

  return (
    <div
      css={css`
        position: relative;
        height: 100%;
      `}
    >
      <Canvas
        camera={{
          position: [helpersSize, helpersSize, helpersSize],
          near: 0.1,
          far: helpersSize * 4,
          up: [0, 0, 1],
          zoom: 0.4,
        }}
        orthographic
      >
        <color attach="background" args={['#dfdfdf']} />
        <ambientLight color="#777777" />
        <directionalLight
          position={[helpersSize, helpersSize * 4, helpersSize * 2]}
        />
        {/* <gridHelper
          args={[helpersSize, helpersSize / voxelSize, '#777777', '#b1b1b1']}
          rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        /> */}

        {walls.length > 0 && (
          <VoxelInstances voxels={walls} map={boxTextureBlue} />
        )}
        {boxes.length > 0 && (
          <VoxelInstances
            voxels={boxes}
            map={boxTextureRed}
            transparent={true}
          />
        )}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#9d4b4b', '#3b5b9d', '#2f7f4f']}
            labelColor="white"
          />
        </GizmoHelper>
        <OrbitControls makeDefault />
      </Canvas>
      <div
        css={css`
          position: absolute;
          bottom: 20px;
          left: 20px;
        `}
      >
        <Paper
          css={css`
            padding: 10px;
          `}
        >
          <>
            Box count: {totalBoxCount} / {boxes.length}
          </>
        </Paper>
      </div>
    </div>
  );
}

export default MainScene;
