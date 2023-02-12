import { css } from '@emotion/react';
import { Paper } from '@mui/material';
import {
  Edges,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from '@react-three/drei';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Vector3Tuple } from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import {
  selectPeriodBoxCount,
  selectVoxelPositions,
} from '../../redux/features/lozengeTiling/lozengeTilingSlice';
import { useAppSelector } from '../../redux/store';

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

function Voxels({
  geometry,
  color,
  withEdges = true,
  transparent = false,
  ...props
}: ThreeElements['mesh'] & {
  color: string;
  withEdges?: boolean;
  transparent?: boolean;
}) {
  return (
    <mesh {...props} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        opacity={0.8}
        transparent={transparent}
      />
      {withEdges && <Edges geometry={geometry} />}
    </mesh>
  );
}

const helpersSize = 10000;

function mergeVoxels(voxels: Vector3Tuple[]) {
  if (voxels.length === 0) {
    return null;
  }
  const boxVoxels = voxels.map((position) => {
    const box = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    box.translate(...alignToGrid(position));
    return box;
  });
  const base = mergeBufferGeometries(boxVoxels);
  return base;
}

// const lineMat = new THREE.LineBasicMaterial({
//   color: 'black',
// });

// lineMat.onBeforeCompile = (shader) => {
//   shader.vertexShader = `
//     	attribute vec3 offset;
//       ${shader.vertexShader}
//     `.replace(
//     `#include <begin_vertex>`,
//     `
//       #include <begin_vertex>
//       transformed += offset;
//       `
//   );
// };

// const boxGeometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
// const edgeGeometry = new THREE.EdgesGeometry().copy(boxGeometry);

// function VoxelInstances({
//   voxels,
//   color,
//   transparent = false,
// }: {
//   voxels: Vector3Tuple[];
//   color: string;
//   transparent?: boolean;
// }) {
//   const boxInstancedMeshRef: React.Ref<
//     THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
//   > | null = useRef(null);

//   const edgeInstancedMeshRef: React.Ref<
//     THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
//   > | null = useRef(null);

//   useEffect(() => {
//     if (boxInstancedMeshRef.current && edgeInstancedMeshRef.current) {
//       const temp = new THREE.Object3D();
//       // Set positions
//       for (let i = 0; i < voxels.length; i++) {
//         temp.position.set(...alignToGrid(voxels[i]));
//         temp.updateMatrix();
//         boxInstancedMeshRef?.current?.setMatrixAt(i, temp.matrix);
//         edgeInstancedMeshRef.current.setMatrixAt(i, temp.matrix);
//       }
//       // Update the instance
//       boxInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
//       edgeInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
//     }
//   }, [voxels]);

//   return (
//     <>
//       <instancedMesh
//         ref={boxInstancedMeshRef}
//         args={[undefined, undefined, voxels.length]}
//         geometry={boxGeometry}
//       >
//         <meshStandardMaterial
//           color={color}
//           opacity={0.8}
//           transparent={transparent}
//         />
//       </instancedMesh>
//       <instancedMesh
//         ref={edgeInstancedMeshRef}
//         args={[undefined, undefined, voxels.length]}
//         geometry={edgeGeometry}
//         material={lineMat}
//       ></instancedMesh>
//     </>
//   );
// }

function MainScene() {
  const { walls, boxes } = useAppSelector(selectVoxelPositions);

  const totalBoxCount = useAppSelector(selectPeriodBoxCount);

  const wallsGeometry = useMemo(() => {
    return mergeVoxels(walls);
  }, [walls]);

  const boxesGeometry = useMemo(() => {
    return mergeVoxels(boxes);
  }, [boxes]);

  return (
    <div
      css={css`
        position: relative;
        height: 100%;
      `}
    >
      <Canvas
        camera={{
          position: [helpersSize * 2, helpersSize, helpersSize],
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
        {wallsGeometry && (
          <Voxels geometry={wallsGeometry} color="#328cf9" withEdges />
        )}
        {boxesGeometry && (
          <Voxels
            geometry={boxesGeometry}
            color="#ff0000"
            withEdges
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
