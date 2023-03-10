import { css } from '@emotion/react';
import { Paper } from '@mui/material';
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Boxes from './Boxes';
import BoxCounters from './BoxCounters';
import Walls from './Walls';

const helpersSize = 10000;

function MainScene() {
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
          position={[helpersSize, helpersSize * 3, helpersSize * 6]}
        />
        {/* <gridHelper
          args={[helpersSize, helpersSize / voxelSize, '#777777', '#b1b1b1']}
          rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        /> */}
        {/* <axesHelper args={[helpersSize]} /> */}
        <Walls />
        <Boxes />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#9d4b4b', '#3b5b9d', '#2f7f4f']}
            labelColor="white"
          />
        </GizmoHelper>
        <OrbitControls makeDefault enableDamping={false} />
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
          <BoxCounters />
        </Paper>
      </div>
    </div>
  );
}

export default MainScene;
