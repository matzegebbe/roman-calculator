var myFirebaseRef = new Firebase("https://roman-calc.firebaseio.com/");
$(document).ready(function() {

    $(".btn").click(function(e) {
        e.preventDefault();

        var val = $(this).data('value'),
            constant = $(this).data('constant'),
            method = $(this).data('method'),
            scval = $('#calculator-screen').val();

        if (val) {
            $('#calculator-screen').val(scval + val);
            return;
        } else if (constant) {
            $('#calculator-screen').val(scval + ' ' + constant + ' ');
        } else if (method) {
            switch (method) {
                case 'reset':
                    reset();
                    break;
                case 'calculate':
                    calculate(scval);
                    break;
                default:
                    break;
            }
        }
    });
});

function calculate(cstr) {
    $('#arabic-calculator-result').html('');
    var res = cstr.split(" ");
    var error = false;

    res.forEach(function(s) {
        if (s === '+' || s === '-' || s === '*' || s === '/')
            $('#arabic-calculator-result').append(s + ' ');
        else {
            var roman = deromanize(s);
            if (roman === false) {
                error = true;
            } else
                $('#arabic-calculator-result').append(roman + ' ');
        }
    });

    if (error)
        return;

    var astr = $('#arabic-calculator-result').html();
    var aresult = eval(astr);
    if (aresult <= 0) {
        $('#calculator-result').html('<p class="bg-danger">Error. Result below or equal to zero.</p>');
        return;
    }else if(Math.floor(aresult) !== aresult){
        $('#calculator-result').html('<p class="bg-danger">Error. Result is no Integer.</p>');
        return;
    }

    var rresult = romanize(aresult);
    $('#calculator-result').html(rresult);

    addHistory(cstr, rresult, astr, aresult);


}

function addHistory(cstr, rresult, astr, aresult) {
    var his = new Object();
    his.cstr = cstr;
    his.rresult = rresult;
    his.astr = astr;
    his.aresult = aresult;
    var jhis = JSON.stringify(his);
    myFirebaseRef.push().set(jhis);
    var shis = cstr + ' = ' + rresult + ' (' + astr + ' = ' + aresult + ' )';
    $('#calc-history-list').prepend('<li>'+shis+'</li>');
}

function reset() {
    result = 0;
    $('#calculator-screen').val('');
    $('#calculator-result').html('&nbsp;');
    $('#arabic-calculator-result').html('');
}

// http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function rvalidator(str) {
    validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/
    if (validator.test(str)) {
        return true;
    } else {
        $('#calculator-result').html('<p class="bg-danger">Error. Calculation contains an invalid roman number (' + str + ').</p>');
        $('#arabic-calculator-result').html('');
        return false;
    }
}

function romanize(num) {
    if (!+num)
        return false;
    var digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
        ],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

function deromanize(str) {
    var str = str.toUpperCase(),

        token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g,
        key = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
        },
        num = 0,
        m;
    if (!(str && rvalidator(str)))
        return false;
    while (m = token.exec(str)) {
        num += key[m[0]];
    }
    return num;
}

/*function romanize(num) {
  var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
      roman = '',
      i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

function deromanize( roman ) {
  var roman = roman.toUpperCase(),
      lookup = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000},
      arabic = 0,
      i = roman.length;
  while (i--) {
    if ( lookup[roman[i]] < lookup[roman[i+1]] )
      arabic -= lookup[roman[i]];
    else
      arabic += lookup[roman[i]];
  }
  return arabic;
}*/
