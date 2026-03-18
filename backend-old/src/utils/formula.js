/* eslint-disable import/prefer-default-export */
const constant = {
  zebu: {
    tempMax: 40.0,
    tempMin: 36.5,
    respMax: 120,
    respMin: 10,
  },
  crossBreed: {
    tempMax: 42.0,
    tempMin: 37.0,
    respMax: 150,
    respMin: 10,
  },
  murrah: {
    tempMax: 42.0,
    tempMin: 37.0,
    respMax: 150,
    respMin: 10,
  },
};

export function strainIndexCalculator(obsTempRate, obsRespRate, category) {
  let constantValue;
  if (category === 'zebu') {
    constantValue = { ...constant.zebu };
    console.log(constantValue);
  }
  if (category === 'crossBreed') {
    constantValue = { ...constant.crossBreed };
  }
  if (category === 'murrah') {
    constantValue = { ...constant.murrah };
  }
  const leftValue =
    (obsTempRate - constantValue.tempMin) /
    (constantValue.tempMax - constantValue.tempMin);
  const rightValue =
    (obsRespRate - constantValue.respMin) /
    (constantValue.respMax - constantValue.respMin);
  const strainIndex = 5 * (leftValue + rightValue);
  return parseFloat(strainIndex).toFixed(2);
}
