/* ============================================================
   dradityax shared buddy — THE chibi character.
   Single source of truth, used by BOTH:
     · the homepage (/)
     · the game (/world/)
   Edit the look here once and both update. Do not duplicate
   this geometry anywhere else.
   Usage: buildBuddy(THREE, M) where M = {
     TEE, SKIN, HAIR, DENIM, SHOE, BLUSH, EYEB, EYEW  (materials)
   }
   Returns { group, hipsG, torsoG, headG,
             armL:{sh,el}, armR:{sh,el},
             legL:{hip,knee}, legR:{hip,knee},
             eyeL, eyeR, bodyMesh }
   ============================================================ */
function buildBuddy(THREE, M){
  var group = new THREE.Group();

  function ball(r, mat, x, y, z, sx, sy, sz, parent){
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), mat);
    m.position.set(x, y, z);
    m.scale.set(sx || 1, sy || 1, sz || 1);
    m.castShadow = true;
    (parent || group).add(m);
    return m;
  }
  function capsule(r, len, mat, x, y, z, parent){
    var m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    (parent || group).add(m);
    return m;
  }
  function cyl(rt, rb, h, mat, x, y, z, parent){
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 20), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    (parent || group).add(m);
    return m;
  }

  // ---- hips ---- (rest height; homepage overrides per-frame for sit/jump)
  var hipsG = new THREE.Group(); hipsG.position.y = 0.62; group.add(hipsG);
  ball(0.150, M.DENIM, 0, 0, 0, 1.0, 0.80, 0.90, hipsG);

  // ---- torso ----
  var torsoG = new THREE.Group(); torsoG.position.set(0, 0.08, 0); hipsG.add(torsoG);
  var bodyMesh = capsule(0.155, 0.14, M.TEE, 0, 0.17, 0, torsoG);
  var shoulders = capsule(0.060, 0.26, M.TEE, 0, 0.30, 0, torsoG);
  shoulders.rotation.z = Math.PI / 2;
  ball(0.068, M.TEE, 0.185, 0.285, 0.01, 1, 1, 1, torsoG);
  ball(0.068, M.TEE, -0.185, 0.285, 0.01, 1, 1, 1, torsoG);
  cyl(0.050, 0.058, 0.08, M.SKIN, 0, 0.36, 0, torsoG);

  // ---- head: big, cute ----
  var headG = new THREE.Group(); headG.position.set(0, 0.44, 0.01); torsoG.add(headG);
  ball(0.210, M.SKIN, 0, 0.02, 0.01, 1.0, 1.02, 0.96, headG);
  ball(0.225, M.HAIR, 0, 0.055, -0.025, 1.02, 0.95, 1.02, headG);   // hair cap
  ball(0.100, M.HAIR, 0, 0.160, 0.130, 1.70, 0.65, 0.75, headG);    // fringe
  ball(0.035, M.SKIN, 0.205, 0.02, 0.0, 1, 1, 1, headG);            // ears
  ball(0.035, M.SKIN, -0.205, 0.02, 0.0, 1, 1, 1, headG);
  var eyeL = ball(0.030, M.EYEB, 0.078, 0.030, 0.175, 1, 1.25, 0.6, headG);
  var eyeR = ball(0.030, M.EYEB, -0.078, 0.030, 0.175, 1, 1.25, 0.6, headG);
  eyeL.userData.sy = 1.25; eyeR.userData.sy = 1.25;                // blink baseline
  ball(0.010, M.EYEW, 0.088, 0.042, 0.198, 1, 1, 0.6, headG);       // glints
  ball(0.010, M.EYEW, -0.068, 0.042, 0.198, 1, 1, 0.6, headG);
  ball(0.034, M.BLUSH, 0.128, -0.035, 0.148, 1, 0.65, 0.45, headG); // blush
  ball(0.034, M.BLUSH, -0.128, -0.035, 0.148, 1, 0.65, 0.45, headG);

  // ---- arms ----
  function buildArm(side){
    var sh = new THREE.Group(); sh.position.set(0.215 * side, 0.28, 0); torsoG.add(sh);
    capsule(0.052, 0.08, M.TEE, 0, -0.08, 0.005, sh);
    var el = new THREE.Group(); el.position.set(0, -0.17, 0.01); sh.add(el);
    capsule(0.044, 0.08, M.SKIN, 0, -0.075, 0, el);
    ball(0.056, M.SKIN, 0, -0.165, 0.01, 0.9, 1.0, 1.0, el);
    return { sh: sh, el: el };
  }
  var armL = buildArm(-1), armR = buildArm(1);

  // ---- legs ----
  function buildLeg(side){
    var hip = new THREE.Group(); hip.position.set(0.095 * side, -0.02, 0); hipsG.add(hip);
    capsule(0.068, 0.12, M.DENIM, 0, -0.11, 0, hip);
    var knee = new THREE.Group(); knee.position.set(0, -0.24, 0); hip.add(knee);
    capsule(0.054, 0.12, M.DENIM, 0, -0.12, 0, knee);
    ball(0.075, M.SHOE, 0, -0.315, 0.05, 1, 0.6, 1.5, knee);
    return { hip: hip, knee: knee };
  }
  var legL = buildLeg(-1), legR = buildLeg(1);

  return {
    group: group, hipsG: hipsG, torsoG: torsoG, headG: headG,
    armL: armL, armR: armR, legL: legL, legR: legR,
    eyeL: eyeL, eyeR: eyeR, bodyMesh: bodyMesh
  };
}
