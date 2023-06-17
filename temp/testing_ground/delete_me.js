// let x = 2 + false;
// let y = false + 2;
// let a = 1;
// let b = 2
// let foo = `foo ${a+b}` // why does javascript let me get rid of semicolons?
// let foo2 = +{};

// let A = 'a';
// let B = A+1;

// let foo = Array((3,4)).fill(false);


// let cols = 2;
// let rows = 3;
// let board_state = Array.from(Array(rows), () => Array(cols).fill(0));
// // board_state[1][1] = 4;

// let test = '';
// for (let i = 0; i < board_state.length; ++i)
// {
//     for (let j=0; j < board_state[i].length; ++j)
//     {
//         test = test + board_state[i][j];
//     }
//     if (i != board_state.length -1)
//     {
//         test = test + '\n';
//     }
// }
// console.log(test);

// console.log(board_state.length)
// console.log(board_state[0].length)
// console.log(board_state[0])
// let foo2 = "";
// foo2 = foo2 + board_state[0];
// console.log(foo2);

// let b = 4;

let un_seen = 0;
function paramless()
{
    un_seen = 5;
}

function adder(a,b)
{
    return a+b;
}

let inter1 = paramless;
let inter2 = adder;

function composite(inter1, inter2)
{
    inter1;
    // return inter2(1,2);
}

composite();

debugger;