let blinkTimeoutId: number | null = null;
let pigAnimationLoopId: number | null = null;
let isWiggling = false;

export function initPigAnimation() {
  const svg = document.querySelector(".cochon-svg") as SVGElement | null;
  const head = document.getElementById("head");
  const snoutGroup = document.getElementById("snout-group");
  const leftEar = document.getElementById("left-ear");
  const rightEar = document.getElementById("right-ear");
  const leftEye = document.getElementById("left-eye");
  const rightEye = document.getElementById("right-eye");

  if (!svg || !head || !snoutGroup || !leftEar || !rightEar || !leftEye || !rightEye) {
    return;
  }

  const leftEyeOrigX = parseFloat(leftEye.getAttribute("cx") || "0");
  const leftEyeOrigY = parseFloat(leftEye.getAttribute("cy") || "0");
  const rightEyeOrigX = parseFloat(rightEye.getAttribute("cx") || "0");
  const rightEyeOrigY = parseFloat(rightEye.getAttribute("cy") || "0");
  const eyeOriginalRy = parseFloat(leftEye.getAttribute("ry") || "4");

  const maxSnoutOffset = 1;
  const maxEyeOffset = 0.8;
  const maxHeadOffset = 0.5;
  const maxEarOffset = 0.2;

  const smoothingFactor = 0.2;
  let targetSnoutTx = 0, targetSnoutTy = 0, targetSnoutRotation = 0;
  let targetHeadTx = 0, targetHeadTy = 0;
  let targetLeftEarTx = 0, targetLeftEarTy = 0;
  let targetRightEarTx = 0, targetRightEarTy = 0;
  let targetLeftEyeCx = leftEyeOrigX, targetLeftEyeCy = leftEyeOrigY;
  let targetRightEyeCx = rightEyeOrigX, targetRightEyeCy = rightEyeOrigY;
  
  let currentSnoutTx = 0, currentSnoutTy = 0, currentSnoutRotation = 0;
  let currentHeadTx = 0, currentHeadTy = 0;
  let currentLeftEarTx = 0, currentLeftEarTy = 0;
  let currentRightEarTx = 0, currentRightEarTy = 0;
  let currentLeftEyeCx = leftEyeOrigX, currentLeftEyeCy = leftEyeOrigY;
  let currentRightEyeCx = rightEyeOrigX, currentRightEyeCy = rightEyeOrigY;

  const wiggleThreshold = 60;
  const wiggleAmplitude = 6;
  const wiggleFrequency = 0.025;

  const blinkDuration = 100;
  const blinkRyValue = 1;
  const minBlinkInterval = 5000;
  const maxBlinkInterval = 8000;

  function updatePigState(event: MouseEvent) {
    if (!svg) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const svgRect = svg.getBoundingClientRect();
    const svgCenterX = svgRect.left + svgRect.width / 2;
    const svgCenterY = svgRect.top + svgRect.height / 2;
    const deltaX = mouseX - svgCenterX;
    const deltaY = mouseY - svgCenterY;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    isWiggling = distance < wiggleThreshold;

    const normalizedOffsetX = svgRect.width ? deltaX / (svgRect.width / 2) : 0;
    const normalizedOffsetY = svgRect.height ? deltaY / (svgRect.height / 2) : 0;

    targetSnoutTx = normalizedOffsetX * maxSnoutOffset;
    targetSnoutTy = normalizedOffsetY * maxSnoutOffset;
    targetSnoutRotation = Math.max(-15, Math.min(15, normalizedOffsetX * -0.4));
    targetHeadTx = normalizedOffsetX * maxHeadOffset;
    targetHeadTy = normalizedOffsetY * maxHeadOffset;
    
    const ear3dTilt = normalizedOffsetX * 0.2;
    const eye3dTilt = normalizedOffsetX * 0.1;

    targetLeftEarTx = normalizedOffsetX * maxEarOffset;
    targetLeftEarTy = (normalizedOffsetY * maxEarOffset) + ear3dTilt;
    targetRightEarTx = normalizedOffsetX * maxEarOffset;
    targetRightEarTy = (normalizedOffsetY * maxEarOffset) - ear3dTilt;
    
    const targetLeftEyeTx = normalizedOffsetX * maxEyeOffset;
    const targetLeftEyeTy = (normalizedOffsetY * maxEyeOffset) + eye3dTilt;
    const targetRightEyeTx = normalizedOffsetX * maxEyeOffset;
    const targetRightEyeTy = (normalizedOffsetY * maxEyeOffset) - eye3dTilt;

    targetLeftEyeCx = leftEyeOrigX + targetLeftEyeTx;
    targetLeftEyeCy = leftEyeOrigY + targetLeftEyeTy;
    targetRightEyeCx = rightEyeOrigX + targetRightEyeTx;
    targetRightEyeCy = rightEyeOrigY + targetRightEyeTy;
  }

  let lastPigFrameTime = 0;
  const PIG_FPS = 30;
  const PIG_FRAME_TIME = 1000 / PIG_FPS;

  function pigAnimationLoop(timestamp: number) {
    const elapsed = timestamp - lastPigFrameTime;
    if (elapsed < PIG_FRAME_TIME) {
      pigAnimationLoopId = requestAnimationFrame(pigAnimationLoop);
      return;
    }
    lastPigFrameTime = timestamp;

    currentSnoutTx += (targetSnoutTx - currentSnoutTx) * smoothingFactor;
    currentSnoutTy += (targetSnoutTy - currentSnoutTy) * smoothingFactor;
    currentSnoutRotation += (targetSnoutRotation - currentSnoutRotation) * smoothingFactor;
    currentHeadTx += (targetHeadTx - currentHeadTx) * smoothingFactor;
    currentHeadTy += (targetHeadTy - currentHeadTy) * smoothingFactor;
    currentLeftEarTx += (targetLeftEarTx - currentLeftEarTx) * smoothingFactor;
    currentLeftEarTy += (targetLeftEarTy - currentLeftEarTy) * smoothingFactor;
    currentRightEarTx += (targetRightEarTx - currentRightEarTx) * smoothingFactor;
    currentRightEarTy += (targetRightEarTy - currentRightEarTy) * smoothingFactor;
    currentLeftEyeCx += (targetLeftEyeCx - currentLeftEyeCx) * smoothingFactor;
    currentLeftEyeCy += (targetLeftEyeCy - currentLeftEyeCy) * smoothingFactor;
    currentRightEyeCx += (targetRightEyeCx - currentRightEyeCx) * smoothingFactor;
    currentRightEyeCy += (targetRightEyeCy - currentRightEyeCy) * smoothingFactor;

    let wiggleOffset = 0;
    if (isWiggling) {
      wiggleOffset = Math.sin(Date.now() * wiggleFrequency) * wiggleAmplitude;
    }

    if (head && snoutGroup && leftEar && rightEar && leftEye && rightEye) {
      head.setAttribute("transform", `translate(${currentHeadTx + wiggleOffset} ${currentHeadTy})`);
      snoutGroup.setAttribute("transform", `translate(${currentSnoutTx + wiggleOffset} ${currentSnoutTy}) rotate(${currentSnoutRotation} 100.5 132.5)`);
      leftEar.setAttribute("transform", `translate(${currentLeftEarTx + wiggleOffset} ${currentLeftEarTy})`);
      rightEar.setAttribute("transform", `translate(${currentRightEarTx + wiggleOffset} ${currentRightEarTy})`);

      leftEye.setAttribute("cx", (currentLeftEyeCx + wiggleOffset).toString());
      leftEye.setAttribute("cy", currentLeftEyeCy.toString());
      rightEye.setAttribute("cx", (currentRightEyeCx + wiggleOffset).toString());
      rightEye.setAttribute("cy", currentRightEyeCy.toString());
    }

    pigAnimationLoopId = requestAnimationFrame(pigAnimationLoop);
  }

  function triggerBlink() {
    if (!leftEye || !rightEye) return;
    leftEye.setAttribute("ry", blinkRyValue.toString());
    rightEye.setAttribute("ry", blinkRyValue.toString());
    setTimeout(() => {
      if (!leftEye || !rightEye) return;
      leftEye.setAttribute("ry", eyeOriginalRy.toString());
      rightEye.setAttribute("ry", eyeOriginalRy.toString());
      scheduleNextBlink();
    }, blinkDuration);
  }

  function scheduleNextBlink() {
    if (blinkTimeoutId !== null) {
      clearTimeout(blinkTimeoutId);
    }
    const randomDelay = Math.random() * (maxBlinkInterval - minBlinkInterval) + minBlinkInterval;
    blinkTimeoutId = window.setTimeout(triggerBlink, randomDelay);
  }

  document.removeEventListener("mousemove", updatePigState as EventListener);
  document.addEventListener("mousemove", updatePigState as EventListener);

  if (pigAnimationLoopId !== null) {
    cancelAnimationFrame(pigAnimationLoopId);
    pigAnimationLoopId = null;
  }
  pigAnimationLoop(performance.now());

  scheduleNextBlink();
}
