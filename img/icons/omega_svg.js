var drawOmega = function (ctx, outerCircleColor, innerCircleColor) {
  ctx.clearRect(0,0,19,19)
  ctx.save();
  ctx.fillStyle = outerCircleColor;
  ctx.beginPath();

  ctx.moveTo(12.5,1);
  ctx.lineTo(16.5,4);
  ctx.lineTo(12.5,8.5);
  ctx.lineTo(13.5,11.5);
  ctx.lineTo(3.5,17.5);
  ctx.lineTo(7.5,11.5);
  ctx.lineTo(6.5,8.5);
  ctx.lineTo(12.5,1);

  //ctx.stroke();

  ctx.fill('evenodd');
  ctx.restore();
  ctx.save();
  ctx.fillStyle = outerCircleColor;

};