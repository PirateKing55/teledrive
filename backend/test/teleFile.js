let array = [1, 2, 3, 4, 5];

const obj = {
    name: "he",
    newArr: array.map(item => (item === 3 ? 8 : item))
};

console.log(obj.newArr); 