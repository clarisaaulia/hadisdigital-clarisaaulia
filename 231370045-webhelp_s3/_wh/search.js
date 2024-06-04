function Snowball() {
BaseStemmer = function() {
this.setCurrent = function(value) {
this.current = value;
this.cursor = 0;
this.limit = this.current.length;
this.limit_backward = 0;
this.bra = this.cursor;
this.ket = this.limit;
};
this.getCurrent = function() {
return this.current;
};
this.copy_from = function(other) {
this.current = other.current;
this.cursor = other.cursor;
this.limit = other.limit;
this.limit_backward = other.limit_backward;
this.bra = other.bra;
this.ket = other.ket;
};
this.in_grouping = function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = this.current.charCodeAt(this.cursor);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
this.cursor++;
return true;
};
this.in_grouping_b = function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = this.current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
this.cursor--;
return true;
};
this.out_grouping = function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = this.current.charCodeAt(this.cursor);
if (ch > max || ch < min) {
this.cursor++;
return true;
}
ch -= min;
if ((s[ch >>> 3] & (0X1 << (ch & 0x7))) == 0) {
this.cursor++;
return true;
}
return false;
};
this.out_grouping_b = function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = this.current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) {
this.cursor--;
return true;
}
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) {
this.cursor--;
return true;
}
return false;
};
this.eq_s = function(s)
{
if (this.limit - this.cursor < s.length) return false;
if (this.current.slice(this.cursor, this.cursor + s.length) != s)
{
return false;
}
this.cursor += s.length;
return true;
};
this.eq_s_b = function(s)
{
if (this.cursor - this.limit_backward < s.length) return false;
if (this.current.slice(this.cursor - s.length, this.cursor) != s)
{
return false;
}
this.cursor -= s.length;
return true;
};
 this.find_among = function(v)
{
var i = 0;
var j = v.length;
var c = this.cursor;
var l = this.limit;
var common_i = 0;
var common_j = 0;
var first_key_inspected = false;
while (true)
{
var k = i + ((j - i) >>> 1);
var diff = 0;
var common = common_i < common_j ? common_i : common_j; 
var w = v[k];
var i2;
for (i2 = common; i2 < w[0].length; i2++)
{
if (c + common == l)
{
diff = -1;
break;
}
diff = this.current.charCodeAt(c + common) - w[0].charCodeAt(i2);
if (diff != 0) break;
common++;
}
if (diff < 0)
{
j = k;
common_j = common;
}
else
{
i = k;
common_i = common;
}
if (j - i <= 1)
{
if (i > 0) break; 
if (j == i) break; 
if (first_key_inspected) break;
first_key_inspected = true;
}
}
do {
var w = v[i];
if (common_i >= w[0].length)
{
this.cursor = c + w[0].length;
if (w.length < 4) return w[2];
var res = w[3](this);
this.cursor = c + w[0].length;
if (res) return w[2];
}
i = w[1];
} while (i >= 0);
return 0;
};
this.find_among_b = function(v)
{
var i = 0;
var j = v.length
var c = this.cursor;
var lb = this.limit_backward;
var common_i = 0;
var common_j = 0;
var first_key_inspected = false;
while (true)
{
var k = i + ((j - i) >> 1);
var diff = 0;
var common = common_i < common_j ? common_i : common_j;
var w = v[k];
var i2;
for (i2 = w[0].length - 1 - common; i2 >= 0; i2--)
{
if (c - common == lb)
{
diff = -1;
break;
}
diff = this.current.charCodeAt(c - 1 - common) - w[0].charCodeAt(i2);
if (diff != 0) break;
common++;
}
if (diff < 0)
{
j = k;
common_j = common;
}
else
{
i = k;
common_i = common;
}
if (j - i <= 1)
{
if (i > 0) break;
if (j == i) break;
if (first_key_inspected) break;
first_key_inspected = true;
}
}
do {
var w = v[i];
if (common_i >= w[0].length)
{
this.cursor = c - w[0].length;
if (w.length < 4) return w[2];
var res = w[3](this);
this.cursor = c - w[0].length;
if (res) return w[2];
}
i = w[1];
} while (i >= 0);
return 0;
};
this.replace_s = function(c_bra, c_ket, s)
{
var adjustment = s.length - (c_ket - c_bra);
this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
this.limit += adjustment;
if (this.cursor >= c_ket) this.cursor += adjustment;
else if (this.cursor > c_bra) this.cursor = c_bra;
return adjustment;
};
this.slice_check = function()
{
if (this.bra < 0 ||
this.bra > this.ket ||
this.ket > this.limit ||
this.limit > this.current.length)
{
return false;
}
return true;
};
this.slice_from = function(s)
{
var result = false;
if (this.slice_check())
{
this.replace_s(this.bra, this.ket, s);
result = true;
}
return result;
};
this.slice_del = function()
{
return this.slice_from("");
};
this.insert = function(c_bra, c_ket, s)
{
var adjustment = this.replace_s(c_bra, c_ket, s);
if (c_bra <= this.bra) this.bra += adjustment;
if (c_bra <= this.ket) this.ket += adjustment;
};
this.slice_to = function()
{
var result = '';
if (this.slice_check())
{
result = this.current.slice(this.bra, this.ket);
}
return result;
};
this.assign_to = function()
{
return this.current.slice(0, this.limit);
};
};
EnglishStemmer = function() {
var base = new BaseStemmer();
 var a_0 = [
["arsen", -1, -1],
["commun", -1, -1],
["gener", -1, -1]
];
 var a_1 = [
["'", -1, 1],
["'s'", 0, 1],
["'s", -1, 1]
];
 var a_2 = [
["ied", -1, 2],
["s", -1, 3],
["ies", 1, 2],
["sses", 1, 1],
["ss", 1, -1],
["us", 1, -1]
];
 var a_3 = [
["", -1, 3],
["bb", 0, 2],
["dd", 0, 2],
["ff", 0, 2],
["gg", 0, 2],
["bl", 0, 1],
["mm", 0, 2],
["nn", 0, 2],
["pp", 0, 2],
["rr", 0, 2],
["at", 0, 1],
["tt", 0, 2],
["iz", 0, 1]
];
 var a_4 = [
["ed", -1, 2],
["eed", 0, 1],
["ing", -1, 2],
["edly", -1, 2],
["eedly", 3, 1],
["ingly", -1, 2]
];
 var a_5 = [
["anci", -1, 3],
["enci", -1, 2],
["ogi", -1, 13],
["li", -1, 15],
["bli", 3, 12],
["abli", 4, 4],
["alli", 3, 8],
["fulli", 3, 9],
["lessli", 3, 14],
["ousli", 3, 10],
["entli", 3, 5],
["aliti", -1, 8],
["biliti", -1, 12],
["iviti", -1, 11],
["tional", -1, 1],
["ational", 14, 7],
["alism", -1, 8],
["ation", -1, 7],
["ization", 17, 6],
["izer", -1, 6],
["ator", -1, 7],
["iveness", -1, 11],
["fulness", -1, 9],
["ousness", -1, 10]
];
 var a_6 = [
["icate", -1, 4],
["ative", -1, 6],
["alize", -1, 3],
["iciti", -1, 4],
["ical", -1, 4],
["tional", -1, 1],
["ational", 5, 2],
["ful", -1, 5],
["ness", -1, 5]
];
 var a_7 = [
["ic", -1, 1],
["ance", -1, 1],
["ence", -1, 1],
["able", -1, 1],
["ible", -1, 1],
["ate", -1, 1],
["ive", -1, 1],
["ize", -1, 1],
["iti", -1, 1],
["al", -1, 1],
["ism", -1, 1],
["ion", -1, 2],
["er", -1, 1],
["ous", -1, 1],
["ant", -1, 1],
["ent", -1, 1],
["ment", 15, 1],
["ement", 16, 1]
];
 var a_8 = [
["e", -1, 1],
["l", -1, 2]
];
 var a_9 = [
["succeed", -1, -1],
["proceed", -1, -1],
["exceed", -1, -1],
["canning", -1, -1],
["inning", -1, -1],
["earring", -1, -1],
["herring", -1, -1],
["outing", -1, -1]
];
 var a_10 = [
["andes", -1, -1],
["atlas", -1, -1],
["bias", -1, -1],
["cosmos", -1, -1],
["dying", -1, 3],
["early", -1, 9],
["gently", -1, 7],
["howe", -1, -1],
["idly", -1, 6],
["lying", -1, 4],
["news", -1, -1],
["only", -1, 10],
["singly", -1, 11],
["skies", -1, 2],
["skis", -1, 1],
["sky", -1, -1],
["tying", -1, 5],
["ugly", -1, 8]
];
 var  g_v = [17, 65, 16, 1];
 var  g_v_WXY = [1, 17, 65, 208, 1];
 var  g_valid_LI = [55, 141, 2];
var  B_Y_found = false;
var  I_p2 = 0;
var  I_p1 = 0;
function r_prelude() {
B_Y_found = false;
var  v_1 = base.cursor;
lab0: {
base.bra = base.cursor;
if (!(base.eq_s("'")))
{
break lab0;
}
base.ket = base.cursor;
if (!base.slice_del())
{
return false;
}
}
base.cursor = v_1;
var  v_2 = base.cursor;
lab1: {
base.bra = base.cursor;
if (!(base.eq_s("y")))
{
break lab1;
}
base.ket = base.cursor;
if (!base.slice_from("Y"))
{
return false;
}
B_Y_found = true;
}
base.cursor = v_2;
var  v_3 = base.cursor;
lab2: {
while(true)
{
var  v_4 = base.cursor;
lab3: {
golab4: while(true)
{
var  v_5 = base.cursor;
lab5: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab5;
}
base.bra = base.cursor;
if (!(base.eq_s("y")))
{
break lab5;
}
base.ket = base.cursor;
base.cursor = v_5;
break golab4;
}
base.cursor = v_5;
if (base.cursor >= base.limit)
{
break lab3;
}
base.cursor++;
}
if (!base.slice_from("Y"))
{
return false;
}
B_Y_found = true;
continue;
}
base.cursor = v_4;
break;
}
}
base.cursor = v_3;
return true;
};
function r_mark_regions() {
I_p1 = base.limit;
I_p2 = base.limit;
var  v_1 = base.cursor;
lab0: {
lab1: {
var  v_2 = base.cursor;
lab2: {
if (base.find_among(a_0) == 0)
{
break lab2;
}
break lab1;
}
base.cursor = v_2;
golab3: while(true)
{
lab4: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab4;
}
break golab3;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
golab5: while(true)
{
lab6: {
if (!(base.out_grouping(g_v, 97, 121)))
{
break lab6;
}
break golab5;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
}
I_p1 = base.cursor;
golab7: while(true)
{
lab8: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab8;
}
break golab7;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
golab9: while(true)
{
lab10: {
if (!(base.out_grouping(g_v, 97, 121)))
{
break lab10;
}
break golab9;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
I_p2 = base.cursor;
}
base.cursor = v_1;
return true;
};
function r_shortv() {
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.out_grouping_b(g_v_WXY, 89, 121)))
{
break lab1;
}
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
if (!(base.out_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.out_grouping_b(g_v, 97, 121)))
{
return false;
}
if (!(base.in_grouping_b(g_v, 97, 121)))
{
return false;
}
if (base.cursor > base.limit_backward)
{
return false;
}
}
return true;
};
function r_R1() {
if (!(I_p1 <= base.cursor))
{
return false;
}
return true;
};
function r_R2() {
if (!(I_p2 <= base.cursor))
{
return false;
}
return true;
};
function r_Step_1a() {
var  among_var;
var  v_1 = base.limit - base.cursor;
lab0: {
base.ket = base.cursor;
if (base.find_among_b(a_1) == 0)
{
base.cursor = base.limit - v_1;
break lab0;
}
base.bra = base.cursor;
if (!base.slice_del())
{
return false;
}
}
base.ket = base.cursor;
among_var = base.find_among_b(a_2);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
if (!base.slice_from("ss"))
{
return false;
}
break;
case 2:
lab1: {
var  v_2 = base.limit - base.cursor;
lab2: {
{
var  c1 = base.cursor - 2;
if (base.limit_backward > c1 || c1 > base.limit)
{
break lab2;
}
base.cursor = c1;
}
if (!base.slice_from("i"))
{
return false;
}
break lab1;
}
base.cursor = base.limit - v_2;
if (!base.slice_from("ie"))
{
return false;
}
}
break;
case 3:
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
golab3: while(true)
{
lab4: {
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab4;
}
break golab3;
}
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_1b() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_4);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
if (!r_R1())
{
return false;
}
if (!base.slice_from("ee"))
{
return false;
}
break;
case 2:
var  v_1 = base.limit - base.cursor;
golab0: while(true)
{
lab1: {
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break golab0;
}
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
}
base.cursor = base.limit - v_1;
if (!base.slice_del())
{
return false;
}
var  v_3 = base.limit - base.cursor;
among_var = base.find_among_b(a_3);
if (among_var == 0)
{
return false;
}
base.cursor = base.limit - v_3;
switch (among_var) {
case 1:
{
var  c1 = base.cursor;
base.insert(base.cursor, base.cursor, "e");
base.cursor = c1;
}
break;
case 2:
base.ket = base.cursor;
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
base.bra = base.cursor;
if (!base.slice_del())
{
return false;
}
break;
case 3:
if (base.cursor != I_p1)
{
return false;
}
var  v_4 = base.limit - base.cursor;
if (!r_shortv())
{
return false;
}
base.cursor = base.limit - v_4;
{
var  c2 = base.cursor;
base.insert(base.cursor, base.cursor, "e");
base.cursor = c2;
}
break;
}
break;
}
return true;
};
function r_Step_1c() {
base.ket = base.cursor;
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.eq_s_b("y")))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.eq_s_b("Y")))
{
return false;
}
}
base.bra = base.cursor;
if (!(base.out_grouping_b(g_v, 97, 121)))
{
return false;
}
lab2: {
if (base.cursor > base.limit_backward)
{
break lab2;
}
return false;
}
if (!base.slice_from("i"))
{
return false;
}
return true;
};
function r_Step_2() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_5);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R1())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("tion"))
{
return false;
}
break;
case 2:
if (!base.slice_from("ence"))
{
return false;
}
break;
case 3:
if (!base.slice_from("ance"))
{
return false;
}
break;
case 4:
if (!base.slice_from("able"))
{
return false;
}
break;
case 5:
if (!base.slice_from("ent"))
{
return false;
}
break;
case 6:
if (!base.slice_from("ize"))
{
return false;
}
break;
case 7:
if (!base.slice_from("ate"))
{
return false;
}
break;
case 8:
if (!base.slice_from("al"))
{
return false;
}
break;
case 9:
if (!base.slice_from("ful"))
{
return false;
}
break;
case 10:
if (!base.slice_from("ous"))
{
return false;
}
break;
case 11:
if (!base.slice_from("ive"))
{
return false;
}
break;
case 12:
if (!base.slice_from("ble"))
{
return false;
}
break;
case 13:
if (!(base.eq_s_b("l")))
{
return false;
}
if (!base.slice_from("og"))
{
return false;
}
break;
case 14:
if (!base.slice_from("less"))
{
return false;
}
break;
case 15:
if (!(base.in_grouping_b(g_valid_LI, 99, 116)))
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_3() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_6);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R1())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("tion"))
{
return false;
}
break;
case 2:
if (!base.slice_from("ate"))
{
return false;
}
break;
case 3:
if (!base.slice_from("al"))
{
return false;
}
break;
case 4:
if (!base.slice_from("ic"))
{
return false;
}
break;
case 5:
if (!base.slice_del())
{
return false;
}
break;
case 6:
if (!r_R2())
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_4() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_7);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R2())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_del())
{
return false;
}
break;
case 2:
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.eq_s_b("s")))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.eq_s_b("t")))
{
return false;
}
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_5() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_8);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!r_R2())
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!r_R1())
{
return false;
}
{
var  v_2 = base.limit - base.cursor;
lab2: {
if (!r_shortv())
{
break lab2;
}
return false;
}
base.cursor = base.limit - v_2;
}
}
if (!base.slice_del())
{
return false;
}
break;
case 2:
if (!r_R2())
{
return false;
}
if (!(base.eq_s_b("l")))
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_exception2() {
base.ket = base.cursor;
if (base.find_among_b(a_9) == 0)
{
return false;
}
base.bra = base.cursor;
if (base.cursor > base.limit_backward)
{
return false;
}
return true;
};
function r_exception1() {
var  among_var;
base.bra = base.cursor;
among_var = base.find_among(a_10);
if (among_var == 0)
{
return false;
}
base.ket = base.cursor;
if (base.cursor < base.limit)
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("ski"))
{
return false;
}
break;
case 2:
if (!base.slice_from("sky"))
{
return false;
}
break;
case 3:
if (!base.slice_from("die"))
{
return false;
}
break;
case 4:
if (!base.slice_from("lie"))
{
return false;
}
break;
case 5:
if (!base.slice_from("tie"))
{
return false;
}
break;
case 6:
if (!base.slice_from("idl"))
{
return false;
}
break;
case 7:
if (!base.slice_from("gentl"))
{
return false;
}
break;
case 8:
if (!base.slice_from("ugli"))
{
return false;
}
break;
case 9:
if (!base.slice_from("earli"))
{
return false;
}
break;
case 10:
if (!base.slice_from("onli"))
{
return false;
}
break;
case 11:
if (!base.slice_from("singl"))
{
return false;
}
break;
}
return true;
};
function r_postlude() {
if (!B_Y_found)
{
return false;
}
while(true)
{
var  v_1 = base.cursor;
lab0: {
golab1: while(true)
{
var  v_2 = base.cursor;
lab2: {
base.bra = base.cursor;
if (!(base.eq_s("Y")))
{
break lab2;
}
base.ket = base.cursor;
base.cursor = v_2;
break golab1;
}
base.cursor = v_2;
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
if (!base.slice_from("y"))
{
return false;
}
continue;
}
base.cursor = v_1;
break;
}
return true;
};
this.stem =  function() {
lab0: {
var  v_1 = base.cursor;
lab1: {
if (!r_exception1())
{
break lab1;
}
break lab0;
}
base.cursor = v_1;
lab2: {
{
var  v_2 = base.cursor;
lab3: {
{
var  c1 = base.cursor + 3;
if (0 > c1 || c1 > base.limit)
{
break lab3;
}
base.cursor = c1;
}
break lab2;
}
base.cursor = v_2;
}
break lab0;
}
base.cursor = v_1;
r_prelude();
r_mark_regions();
base.limit_backward = base.cursor; base.cursor = base.limit;
var  v_5 = base.limit - base.cursor;
r_Step_1a();
base.cursor = base.limit - v_5;
lab4: {
var  v_6 = base.limit - base.cursor;
lab5: {
if (!r_exception2())
{
break lab5;
}
break lab4;
}
base.cursor = base.limit - v_6;
var  v_7 = base.limit - base.cursor;
r_Step_1b();
base.cursor = base.limit - v_7;
var  v_8 = base.limit - base.cursor;
r_Step_1c();
base.cursor = base.limit - v_8;
var  v_9 = base.limit - base.cursor;
r_Step_2();
base.cursor = base.limit - v_9;
var  v_10 = base.limit - base.cursor;
r_Step_3();
base.cursor = base.limit - v_10;
var  v_11 = base.limit - base.cursor;
r_Step_4();
base.cursor = base.limit - v_11;
var  v_12 = base.limit - base.cursor;
r_Step_5();
base.cursor = base.limit - v_12;
}
base.cursor = base.limit_backward;
var  v_13 = base.cursor;
r_postlude();
base.cursor = v_13;
}
return true;
};
this['stemWord'] = function(word) {
base.setCurrent(word);
this.stem();
return base.getCurrent();
};
};
return new EnglishStemmer();
}
wh.search_stemmer = Snowball();
wh.search_baseNameList = [
 "231370045-Ebook%20HD.html",
 "231370045-Ebook%20HD-3.html",
 "231370045-Ebook%20HD-5.html",
 "231370045-Ebook%20HD-6.html",
 "231370045-Ebook%20HD-7.html",
 "231370045-Ebook%20HD-8.html",
 "231370045-Ebook%20HD-9.html",
 "231370045-Ebook%20HD-10.html",
 "231370045-Ebook%20HD-11.html",
 "231370045-Ebook%20HD-12.html",
 "231370045-Ebook%20HD-13.html",
 "231370045-Ebook%20HD-14.html",
 "231370045-Ebook%20HD-15.html",
 "231370045-Ebook%20HD-16.html",
 "231370045-Ebook%20HD-17.html",
 "231370045-Ebook%20HD-18.html",
 "231370045-Ebook%20HD-19.html",
 "231370045-Ebook%20HD-20.html",
 "231370045-Ebook%20HD-21.html",
 "231370045-Ebook%20HD-22.html",
 "231370045-Ebook%20HD-23.html",
 "231370045-Ebook%20HD-24.html",
 "231370045-Ebook%20HD-25.html",
 "231370045-Ebook%20HD-26.html",
 "231370045-Ebook%20HD-27.html",
 "231370045-Ebook%20HD-28.html",
 "231370045-Ebook%20HD-29.html",
 "231370045-Ebook%20HD-30.html",
 "231370045-Ebook%20HD-31.html",
 "231370045-Ebook%20HD-32.html",
 "231370045-Ebook%20HD-33.html",
 "231370045-Ebook%20HD-34.html",
 "231370045-Ebook%20HD-35.html",
 "231370045-Ebook%20HD-36.html",
 "231370045-Ebook%20HD-37.html",
 "231370045-Ebook%20HD-38.html",
 "231370045-Ebook%20HD-39.html",
 "231370045-Ebook%20HD-40.html",
 "231370045-Ebook%20HD-41.html",
 "231370045-Ebook%20HD-42.html",
 "231370045-Ebook%20HD-43.html",
 "231370045-Ebook%20HD-44.html"
];
wh.search_titleList = [
 "Hadis Shahih Bukhari 3.498-3.600",
 "KITAB KEUTAMAAN PARA SAHABAT",
 "Sifat terpuji Ja’far bin Abu Thalib",
 "Al Abbas bin Abdul Muthalib",
 "Sifat terpuji kerabat Rasulullah Shallallahu &#39;alaihi wa Sallam",
 "Sifat terpuji Az Zubair bin Al Awwam",
 "Thalhah bin Ubaidillah",
 "Sifat terpuji Sa’ad bin Abu Waqqash",
 "Kerabat Rasulullah Shallallahu &#39;alaihi wa Sallam",
 "Sifat terpuji Zaid bin Haritsah, budak Nabi Shallallahu &#39;alaihi wa Sallam",
 "Usamah bin Zaid",
 "Sifat terpuji Abdullah bin Umar",
 "Sifat terpuji Ammar bin Hudzaifah",
 "Sifat terpuji Abu Ubaidah Ibnul Jarrah",
 "Sifat terpuji Hasan Husein",
 "Sifat terpuji Bilal bin Rabah",
 "Ibnu Abbas",
 "Sifat terpuji Khalid bin Walid",
 "Sifat terpuji Salim Abu Hudzaifah",
 "Sifat terpuji Abdullah bin Mas’ud",
 "Muawiyah radhiallahu ‘anhu",
 "Sifat terpuji Fatimah",
 "Keutamaan Aisyah",
 "Sifat terpuji Kaum Anshar",
 "Sabda Nabi Shallallahu &#39;alaihi wa Sallam “Kalau bukan karena hijrah…”",
 "Nabi Shallallahu &#39;alaihi wa Sallam mempersaudarakan antara Muhajirin dan Anshar",
 "Mencintai Kaum Anshar",
 "Sabda Nabi Shallallahu &#39;alaihi wa Sallam kepada orang-orang Anshar “Kalian adalah…”",
 "Mengikuti Kaum Anshar",
 "Keutamaan rumah-rumah Anshar",
 "Sabda Nabi Shallallahu &#39;alaihi wa Sallam kepada orang-orang Anshar “Sabarlah kalian…”",
 "Doa Nabi Shallallahu &#39;alaihi wa Sallam untuk Muhajirin dan Anshar",
 "Firman Allah “Dan mereka mengutamakan (orang-orang Muhajirin…”",
 "Sabda Nabi Shallallahu &#39;alaihi wa Sallam “Terimalah mereka yang berbuat baik dan maafkanlah…”",
 "Sifat terpuji Sa’ad bin Mu’adz",
 "Sifat terpuji Usaid bin Hudair dan Abbad bin Bisyr",
 "Sifat terpuji Mu’adz bin Jabal",
 "Sifat terpuji Sa’d bin Ubadah",
 "Sifat terpuji Ubay bin Ka’b",
 "Sifat terpuji Zaid bin Tsabit",
 "Sifat terpuji Abu Thalhah",
 "PROFIL PENULIS"
];
wh.search_wordMap= {
"كَيْ": [2],
"membiarkannya": [10],
"ثَلَاثَ": [27],
"perhiasan": [[25,40]],
"mempunyai": [25],
"حَاضِنَةَ": [10],
"ad-darda": [12],
"آخَرُ": [[5,11]],
"وَالنَّهَارِ": [12,19],
"halal": [25],
"فَتَسْقِينَا": [3],
"amirul": [20],
"أَكْرِمِي": [32],
"فَقَامَ": [[8,27]],
"apa-apa": [[2,7,32]],
"سِرَاجَكِ": [32],
"siapakah": [[5,10],[12,32,39]],
"binti": [40],
"saja": [2,[12,19,22,40]],
"فَقَالَ": [1,25,[5,10,32],[22,29,34],[4,9,11,14,27],[3,12,17,18,19,20,23,24,31,33,37,38]],
"merupakan": [5],
"تَخْتَلِفُ": [5],
"al-qur\'an": [[0,16,36,38,39]],
"أَجَلْ": [1],
"أَصَابِعِي": [5],
"كَانَتْ": [[4,10,31]],
"سَرَقَتْ": [10],
"samp": [1],
"تَرَ": [29],
"binsah": [29],
"mengetahuinya": [12,19],
"فِيَّ": [[12,19]],
"نَغْزُو": [7],
"لَأُعْطِيَنَّ": [1],
"menempati": [1],
"صَبِيٌّ": [27],
"memasukkan": [5],
"semalaman": [1],
"أَبَانَ": [20],
"iman": [[0,26]],
"ghazwan": [32],
"sesukamu": [1],
"تَابَعَ": [25],
"مَخْرَجًا": [22],
"jurang": [11],
"ارْقُبُوا": [[4,14]],
"ditangan-nya": [27],
"عَيْنَيْهِ": [1],
"وَبَنُو": [29],
"memandang": [7],
"tsabit": [[35,39],26],
"hunaif": [34],
"جَلِيسًا": [12,19],
"bersikap": [33],
"biasanya": [11],
"atasnya": [10],
"بِالْغَنَائِمِ": [23],
"melewati": [23,7],
"ceraikan": [25],
"إِلَيْنَا": [[1,2]],
"redaksi": [[31,34]],
"sumur": [11],
"قَرِيبِ": [19],
"memegangku": [11],
"ikrimah": [[16,33]],
"pengantar": [0],
"فَأَشْرَفَ": [[13,40]],
"كَمْ": [25],
"seberat": [25],
"وَقَالُوا": [5],
"diberikan": [1],
"tempat": [29,1,37,[24,30,34]],
"a\'idah": [37],
"قُرَيْظَةَ": [5],
"رَأَيْتُكَ": [5],
"membaca": [12,19],
"ad-darda\'bertanya": [12],
"فَدَلُّوهُ": [25],
"hari": [23,[7,25,33],[1,2,5,10,22]],
"hadits": [2],
"وَالذَّكَرِ": [12,19],
"يعني": [12],
"انثرها": [40],
"matikanlah": [32],
"زَعَمَ": [28],
"qainuqa": [25],
"sakitnya": [4],
"mengarungi": [24],
"harb": [[12,18,19]],
"تَقْضُونَ": [1],
"garam": [33],
"sapu": [34],
"kabar": [5],
"niyat": [4],
"عَشَاءً": [32],
"لِلزُّبَيْرِ": [5],
"ubbay": [38],
"جِبْرِيلُ": [22],
"sa\'id": [7,[1,2,10,30,34]],
"وتسبحان": [1],
"berbela": [17],
"أَخْبَرَتْهُ": [1],
"gulita": [35],
"nikmat": [0],
"حَدَّثَنَا": [22,1,14,10,[5,29],[4,7,30,33,34],[19,20,23,27,28,31],[13,25],[6,9,11,12,15,16,26,37],[2,35,38,40],[3,17,18,21,24,32,36,39],8],
"غَيْرُ": [6],
"radhiyallhu\'anhuma": [1],
"إِنَّكُمْ": [[5,20,27,30]],
"يَغْشَى": [12,19],
"ادْعُهُمْ": [1],
"bacaan": [[18,19,36,38]],
"مُسْلِمُ": [[13,26]],
"مُسْلِمٍ": [[10,35]],
"hatim": [1],
"tanah": [[2,10,30,31]],
"عبد": [26],
"danmenidurkan": [32],
"ahzab": [5],
"عَلَيَّ": [[1,9,22,23]],
"hati": [[11,19]],
"وَآسِيَةُ": [22],
"إِسْحَاقَ": [19,[13,34]],
"إِسْحَاقُ": [[11,37]],
"kerasnya": [40],
"خَرَجَ": [[1,30,33]],
"مَعَهُمَا": [35],
"يغشى": [19],
"anas": [14,17],
"فِيهِ": [[1,4,7,12,22,33]],
"meminta": [3,[2,4,10]],
"وَيُؤْثِرُونَ": [32],
"إِيَّاهَا": [22],
"menjulurkan": [10],
"النُّورُ": [35],
"anak": [[10,40],[7,14,16]],
"sikap": [30],
"فَنَمَيْتُ": [28],
"roti": [[2,22,32]],
"anda": [22,[2,4,10,12,20]],
"الْكَذِبُ": [1],
"عَوْفٍ": [25],
"النُّبُوَّةِلَّاللَُّالْعَحَلَدَّيْثَهِنَكِا": [16],
"tanda": [26],
"الْعُكَّةَ": [2],
"dimatikannya": [32],
"mendongakkan": [40],
"dibuat": [22],
"besar": [7,[11,14]],
"بُيُوتِ": [1],
"muhamamd": [10],
"صَالِحًا": [12],
"أُهْدِيَتْ": [34],
"خَيْرُكُمْ": [5],
"بِنْتَ": [8,40],
"السِّرَارِ": [12],
"dialaminya": [5],
"بِنْتُ": [[8,22]],
"فَرَسِهِ": [5],
"cahaya": [35],
"رِسْلِكَ": [1],
"مَالِي": [25],
"ketahui": [5],
"بِكِ": [22],
"langsug": [12],
"rasakan": [1],
"بِكَ": [1],
"satu": [[9,20],[5,8,33]],
"dahulu": [[3,38]],
"وَادِيًا": [[23,24]],
"peristiwa": [11],
"dimaksudkan": [28],
"فِيكُمُ": [19],
"lah": [10],
"فِيكُمْ": [12,19],
"wanita-waita": [22],
"أَتَى": [32],
"lam": [38],
"لِلَّهِ": [15],
"الْمُفْلِحُونَ": [32],
"الرَّزَّاقِ": [[11,14]],
"جَعْفَرٌ": [17],
"مِنْكُنَّ": [22],
"تُرِيدُ": [22],
"جَعْفَرُ": [2],
"جَعْفَرٍ": [[2,14,20,22,25]],
"عَرَفْنَا": [4],
"sikap-sikap": [30],
"مَالًا": [25],
"الْمَخْزُومِيَّةِ": [10],
"جَمَاعَةٌ": [1],
"بُكَيْرٍ": [22],
"لِسَانِ": [12],
"وَائِلٍ": [[19,22]],
"تَجِدْهُ": [1],
"وَاللَّيْلِ": [12,19],
"بِلَالًا": [15],
"ابْتَلَاكُمْ": [22],
"عَمَلِي": [7],
"walid": [17,[4,10,21,23,30,38]],
"وَغَنَائِمُنَا": [23],
"anha": [22,4,[9,10],[21,23]],
"مِنْكُمْ": [12,33],
"مِنْكُمُ": [12],
"لَمَنَادِيلُ": [34],
"anhu": [12,[23,34],[13,14,19,20,22,26,27,30,31,33],[1,3,5,7,15,17,25,29,32,35,37,38,39,40]],
"لَيَضَعُ": [7],
"hadirin": [[8,33]],
"نَاحِيَةٍ": [10],
"sebaik-baik": [29,37],
"سَمَّاكُمُ": [23],
"جُعِلْتُ": [5],
"saya": [10,18],
"jibril": [22],
"pedang-pedang": [23],
"binyahya": [29],
"sayf": [17],
"peperangan": [[1,5]],
"qurrah": [31],
"sholatku": [7],
"ulangilah": [10],
"بِرَكْعَةٍ": [20],
"tidur": [1,11,[9,32]],
"سَيِّدَنَا": [15],
"المؤونة": [25],
"الَّتِي": [[4,6],[1,2]],
"tua": [19,12],
"وَجَدْتُ": [1],
"هَذَيْنِ": [34],
"anshariy": [3],
"razzaq": [11],
"يَكُونُوا": [[1,33]],
"يُقْرِئُكِ": [22],
"رُكُوعَهُ": [10],
"membawa": [[23,25,40],5],
"lalat": [14],
"يَوْمَئِذٍ": [[25,40]],
"pada": [1,5,25,[4,6,7,11,22,31,40],[0,8,10,12,19,23,32,33,35,39]],
"نُمَيْرٍ": [15],
"حُنَيْفٍ": [34],
"diken": [12],
"نَدْخُلُ": [23],
"أَيُّهُمْ": [1],
"صَغِيرٌ": [5],
"tidurkanlah": [32],
"هُرَيْرَةَ": [[2,24],[25,32]],
"فَجُعِلَ": [14],
"شَكَوْا": [22],
"faham": [20],
"الرَّحْمَنِ": [25,10,[19,22,34]],
"khandaq": [31],
"rumah-rumah": [23,[1,29]],
"wa\'il": [[19,22]],
"pernah": [4,[12,14,19,20,23],[1,3,5,6,7,8,9,10,15,33,34,38]],
"جَاءَ": [1,25,12],
"dingin": [1],
"صُفْرَةٍ": [25],
"أَخَذْتُمَا": [1],
"رُعَافٌ": [5],
"muslim": [[0,10,13,26,35]],
"punggung-punggung": [31],
"sayyid": [14],
"za\'ama": [28],
"قَاتَلَ": [6],
"sekarang": [[3,8,9,22]],
"ash-shaltu": [25],
"dalam": [33,[1,10,19,22,23,32],[0,8,9,11,24,25]],
"تَطْعُنُوا": [9],
"tamir": [14],
"الْحَسَنُ": [[3,10,20]],
"الْحَسَنِ": [14],
"عَلِّمْهُ": [16],
"الْحَسَنَ": [14],
"quraizhah": [5,34],
"betisnya": [40],
"مَرْيَمُ": [22],
"bolak-balik": [5],
"أُجِيرَ": [19],
"bapak": [[5,24]],
"tidak": [[1,10],[2,19,25],[4,7,8,22,31,32],[12,14,23,26,29],[6,11,18,20,24,30,33]],
"لَتَعْلَمُونَ": [5],
"مَرْيَمَ": [20],
"الْخَنْدَقِ": [31],
"الِاخْتِلَافَ": [1],
"dunia": [[4,14,22]],
"الْخَنْدَقَ": [31],
"تجيآن": [40],
"wahhab": [22,[4,7]],
"mohonlah": [28],
"memenangkan": [1],
"وَجَعَلَ": [22],
"أَوَّلُ": [4],
"لِتَتَّبِعُوهُ": [22],
"lii": [12],
"يردونني": [19],
"najran": [13],
"memerintahkanku": [38],
"فَأَخْبَرَنِي": [4],
"حَدَّثَنِي": [14,[19,22],[1,7,8,10,20,29,34],[2,3,4,5,6,9,13,23,24,25,30,31,33,36,38,39]],
"pagi": [1,32],
"أَلْزَمُ": [2],
"الْهِجْرَةُ": [24],
"بِنَبِيِّنَا": [3],
"rahman": [25,10,[19,22]],
"فَقَالَتْ": [[4,8,32]],
"rahmat": [22],
"ذلك": [22],
"يَكْذِبُونَ": [23],
"عَدُوِّ": [8],
"الْبِئْرِ": [11],
"menaiki": [33],
"يَحْيَى": [29,[4,7,9,10,11,14,22,30,33,39]],
"shadaqah-shadaqah": [4],
"dapatkan": [5],
"seakan": [[1,32]],
"usamah": [10,9,22,[5,7,14,23]],
"الْجَرَّاحِ": [13],
"mutsannaa": [[3,7,34]],
"بَلَغَنِي": [23],
"أَغْضَبَنِي": [[4,21]],
"sudut": [10],
"سَنَةَ": [5],
"يَشْتَكِي": [1],
"الْمُعَافَى": [20],
"uyainah": [[4,14,21]],
"kulit": [40],
"مَسْلَمَةَ": [1],
"أَلَا": [[1,5,30]],
"البجاري": [[14,22],1,5,[4,7,10,19],[20,23,25,29,30,31,33,34],[2,6,9,11,12,13,15,26,27,28,38],[3,8,16,17,18,21,24,32,35,36,37,39,40]],
"الرَّايَةَ": [1,17],
"شَاهِدٌ": [9],
"وَرَجُلًا": [35],
"namaku": [38],
"syadzan": [33],
"hitam": [33],
"سُلَيْمَانُ": [[9,10,12,18,19,29]],
"بَعْدِي": [30],
"وَقَالُوهُ": [5],
"سُلَيْمَانَ": [[10,11,19]],
"bermimpi": [11],
"bertanya": [[1,5],12,25,19,[10,14],[4,23,33,38,39]],
"dalamnya": [11],
"pale": [25,[9,19,27,29],[1,2,5]],
"barakaatuh": [22],
"tenang": [[1,22]],
"بِمَجْلِسٍ": [33],
"يَكُونَ": [1,19],
"جَبَلٍ": [[18,19,36,38,39]],
"cukup": [25,[29,40]],
"فَجَعَلَ": [[1,14,34]],
"تكبران": [1],
"لِأُبَيٍّ": [38],
"ceritakan": [[1,11,28]],
"وَالَّذِي": [[4,5,27]],
"الْمِنْهَالِ": [14],
"بِالنَّبِيِّ": [14,[1,19]],
"فَانْطَلَقَتْ": [1],
"sakit": [1,[4,22]],
"فَتَشَهَّدَ": [4],
"mempersaudarakan": [25],
"مَحَاسِنَعَمَلِهِ": [1],
"kejadian": [[4,9,22]],
"يَأْتِيَهُمْ": [17],
"الْمُسَيِّبِ": [7],
"ظَهْرِهِ": [1],
"لِلنَّاسِ": [[1,17]],
"وَحَقَّهُمْ": [4],
"sahabatku": [1],
"menarik": [25],
"mencocok-cocokannya": [14],
"يَنْفَعُهُ": [33],
"biin": [5],
"artinya": [[14,22],1,5,[4,7,10,19],[20,23,25,28,29,30,31,33,34],[2,6,9,11,12,13,15,26,27,32,38],[3,8,16,17,18,21,24,35,36,37,39,40]],
"dan": [[22,25],[1,33],19,[4,5],10,[14,29],34,[8,31],35,[0,2,7,32],[9,23,26,30],[12,16,20,24,27,28,39,40],[6,11,13,15,17,18,36,37,38]],
"paman": [3],
"waktu": [[1,22]],
"ihsan": [0],
"katakana": [7],
"enggan": [10],
"فَمُرِي": [22],
"mereka": [33,[1,23],[5,10,32],[25,34],[22,26,28],[4,12],[11,14,17,30],[3,9,19,27,31,39]],
"hingga": [[1,30],[2,19,33],[5,7,11,12,17,25,35]],
"justru": [[29,37]],
"wanita": [27,10,[2,5,22,25]],
"حُكْمِ": [34],
"shahabat-shahabat": [13],
"ثُمَامَةَ": [3],
"وَقُلْتُ": [1],
"بِالْحَصْبَاءِ": [2],
"akhlaqnya": [19],
"إِنَّ": [[22,23],[4,5,7,8,9,10,11,13,19,28,29,34,35,38]],
"حَبَّانُ": [35],
"النَّبْلِ": [40],
"صَلَاةً": [20],
"الطَّعَامِ": [22,33],
"dengan": [14,25,34,1,4,[3,12,19,33],[0,2,5,23,27,40],[10,11,16,20,24,30,31]],
"لَأَحَبَّهُ": [10],
"عَلَيهِ": [1],
"فَبَرَأَ": [1],
"thalhah": [40,6],
"dibantu": [2],
"فَنَلْعَقُ": [2],
"dengar": [[12,18,25]],
"وَقَى": [6],
"ذَا": [37],
"bila": [11,[1,2,8]],
"para": [23,[1,22,34],[0,5,27,32]],
"memperburuk": [1],
"يَسُوءَهَا": [8],
"تَرَكْنَا": [4],
"hajjajj": [10],
"يَسْأَلُونَ": [14],
"فِي": [22,1,[4,10],[9,11,14,25],[5,7,23,40],[2,6,8,20,24,33,35,37]],
"الْمُؤْمِنِينَ": [[20,22]],
"فَذَكَرْتُهُ": [28],
"الْآخِرَهْ": [31],
"makhzumiy": [10],
"biji": [25],
"أَمْرًا": [33],
"بَيْتُهُ": [1],
"tema": [0],
"الْخَزْرَجِ": [37],
"أَنَامُ": [11],
"بَيْتِ": [[19,22]],
"كَالْمِلْحِ": [33],
"besok": [[1,22]],
"sa\'ad": [34,25,[1,29],7,[4,6,9,37]],
"qaza\'ah": [[4,9]],
"jahal": [8],
"allah": [1,12,22,[23,31],[4,10,14,19,28,32],[0,8,15,17,26,33,34,38],[3,5,7,9,11,16,25,40]],
"mengucapkannya": [27,5],
"نُورَثُ": [4],
"الرُّعَافِ": [5],
"حَرِيرٍ": [34],
"فَأَتَتْ": [8],
"tangannya": [[1,10]],
"رَوَاحَةَ": [17],
"alaihis": [1],
"seorang": [[1,10],5,[27,32,40],[2,7,9,11,13,18,19,20,22,23,24,25,28,38,39]],
"حَسِبْتُ": [27],
"menyebabkan": [33],
"الْكِتَابِ": [38],
"mu\'afiy": [20],
"عُرْوَةُ": [[4,5]],
"عُرْوَةَ": [5,10,[4,9]],
"وَكَانَ": [40,[1,2,10,14,25,37]],
"حَلَّتْ": [25],
"انْقَلَبَ": [25],
"كَقَرْنَيِ": [11],
"penghulu": [15],
"bersabda": [29,31,[1,10,14,33],[4,5,8,19,22,26,34],[9,11,13,17,18,21,23,24,25,27,30,36,37,38]],
"ذِي": [2],
"إِنْ": [[2,9,15]],
"أَحَدَنَا": [7],
"إِنّ": [19],
"bermanfaat": [0],
"حَمْزَةَ": [28],
"مُؤْمِنٌ": [26],
"nu\'aim": [10],
"صَدَقَةٌ": [4],
"كُلِّ": [29,37],
"مَعَنَا": [32],
"kedua": [35,[5,7,17,33]],
"فَمَا": [[19,20,25]],
"أُعَلِّمُكُمَا": [1],
"صَدَقَةَ": [4],
"كَذَا": [23],
"صَدَقَةُ": [14],
"perkawinan": [27],
"أَشْبَهَ": [14],
"celah": [23,24],
"uhud": [6,7],
"رَمَدٌ": [1],
"فَتَمَنَّيْتُ": [11],
"memohon": [3],
"melindungi": [[6,40]],
"mendatangi": [[1,5,12,22,23]],
"علي": [14],
"hijaz": [28],
"menyertai": [35],
"harits": [14],
"radhiyalahu\'anhu": [24,[2,25]],
"menjadikannya": [[4,21]],
"memukul-mukulkan": [10],
"menulis": [2],
"memerintahkan": [22],
"أَعُوذُ": [11],
"sejeni": [22],
"أَدْرِي": [18],
"dia": [[5,12],[1,10],25,[19,22],[14,20],[2,11,17,30],[8,9,28],[3,16,18,23,26,27,29,32,33,34,38,39,40]],
"وَمُعَاذُ": [39],
"وَمُعَاذِ": [[18,19,36,38]],
"tsarid": [22],
"musyrikin": [5],
"أَحَبِّكُمْ": [19],
"أم": [10],
"بُرْدٍ": [33],
"الْوَلِيدُ": [10],
"الْوَلِيدِ": [[4,21,23,30,38]],
"neraka": [11],
"perintah": [22],
"bebukitan": [[23,24]],
"الثَّالِثَةِ": [22],
"menemui": [[1,32],[2,8,20,29,30,33]],
"dadaku": [1],
"bersamamu": [5],
"bacakan": [12,19],
"ditimpa": [[3,30]],
"beras": [12,[9,19]],
"wewangian": [25],
"najjar": [29],
"عَائِشَةَ": [22,[4,9,10],[1,23,40]],
"عَائِشَةُ": [22,1],
"فَدَخَلَ": [5,33],
"وَالْعَبَّاسُ": [33],
"جَهْلٍ": [8],
"khudriy": [34],
"murrah": [22,[18,28,38]],
"وَلَأَعْمَلَنَّ": [4],
"orang-orang": [33,22,[1,23],[10,32],[2,11,24,25,27,29,30,31,34,40]],
"وَايْمُ": [9],
"ashar": [20],
"غَزْوَانَ": [32],
"حَصِينٍ": [1],
"menundukkan": [10],
"buahnya": [25],
"بَدْرٍ": [5],
"لِابْنِ": [20,28],
"فَأَرْسَلَ": [[22,34]],
"dedaunan": [7],
"أَعْجَبَهُمَا": [25],
"نَفْسِهِ": [32],
"نَمِرٍ": [10],
"dengki": [34],
"سَهْلًا": [1],
"rusak": [22],
"سَمْنٍ": [25],
"فَبَكَيْتُ": [4],
"humaa": [14],
"فَاسْتَطْعَمْتُ": [1],
"terjaga": [2],
"patut": [9],
"hasil": [25],
"kotoran": [7],
"mendirikan": [11],
"مُظْلِمَةٍ": [35],
"أَوَلَا": [23],
"قَبْلَ": [17],
"أُخْرَى": [24],
"قَبْلُ": [9],
"dijanjikan": [30],
"الْجَعْبَةُ": [40],
"perantaraannya": [14],
"menerima": [1],
"bisa": [[2,12,19,22,40]],
"بني": [29],
"وَنَصَرُوهُ": [24],
"حُمَيْدٍ": [[25,29,31]],
"حُمَيْدِ": [17],
"sebanyak": [[20,27]],
"berdo\'a": [12,[3,16,19,28]],
"إِنَّمَا": [15,4],
"تَابَعَهُ": [7],
"رَأَيْتُنِي": [7],
"عَمَّارًا": [[12,22]],
"عَلَى": [22,1,11,33,34,[4,5,12,14,23,31],[2,7,19,25,29,30,32,37,39,40]],
"ja\'far": [[2,17],[14,20,22,25]],
"يَمُرُّ": [40],
"مَكَّةَ": [23],
"ubaid": [22,[1,5,15,23]],
"رَسُولِهِ": [4],
"dihimpun": [39],
"فَتَكَلَّمَ": [4],
"الزُّبَيْرَ": [5],
"hadiah": [22,34],
"قَرَابَتَهُمْ": [4],
"الزُّبَيْرُ": [5],
"أَبْغَضَهُ": [26],
"apaapa": [32],
"بن": [10,[14,18,26]],
"نُرَى": [19],
"وَالْأُنْثَى": [12,19],
"thalib": [[1,2]],
"فَجَلَسَ": [12],
"أَنْكَحْتُ": [8],
"kepemimpinannya": [9],
"أَكْتَادِنَا": [31],
"الزُّبَيْرِ": [[4,5]],
"بَقِيَ": [4],
"وَإِنَّ": [[5,8,9,13]],
"يَبْقَ": [6],
"kaki-kaki": [9],
"الْعَجَبُ": [23],
"alaihas": [4],
"doa": [31],
"melarang": [20],
"kehitam-hitaman": [14],
"مُعَاذٍ": [34],
"وَاللَّهِ": [22,[1,4,5,8,12,23]],
"manusia": [33,[9,22,27],[1,2]],
"hawariyku": [5],
"bagi": [[0,25],4],
"abdush": [[29,37]],
"mas": [19],
"hariku": [22],
"mau": [[10,32]],
"الْقُرْآنَ": [[18,19,36,38,39]],
"فَبَاتَ": [1],
"kepercayaanku": [33],
"أَنْفُسِهِمْ": [32],
"beram": [15],
"عِصَابَةٌ": [33],
"وَالْوِسَادِ": [[12,19]],
"siapa": [10,[1,5,26,32]],
"يَا": [[1,22],5,[2,4,10,28,29,30,34,40]],
"وَإِنَّا": [28,[3,22]],
"masalah": [10,22],
"رَجُلَيْنِ": [35],
"سَعِيدٍ": [[1,2,10,30,34]],
"يُقْطِعَ": [30],
"سَعِيدَ": [7],
"bait": [[4,14],19],
"mudah-mudahan": [0],
"resepsi": [[25,27]],
"maik": [38],
"sirin": [1],
"حَبَسَهُ": [5],
"أيمن": [10],
"فَقَالُوا": [[1,10],[23,30]],
"وَلَقَدْ": [40,[7,20]],
"بِسَهْمٍ": [7],
"baik": [33,[1,29],[2,25],[0,8,19,34,37]],
"سَعِيدِ": [14],
"inni": [14],
"لَأَبْعَثَنَّ": [13],
"يَأْخُذُهُ": [[10,14]],
"نَزَلُوا": [34],
"فَأَخْبَرَ": [9],
"الْأُمَّةُ": [13],
"mu\'tamir": [[6,10]],
"hasan": [14,10,[3,20,22]],
"اسْتَقْرِئُوا": [[18,19,36]],
"زَائِدَةَ": [[1,7]],
"padah": [[1,20]],
"merah": [1],
"ثَلَاثًا": [[1,5,40]],
"punya": [[2,19,20,32]],
"memanggilku": [10],
"memujinya": [8],
"عِنْدِ": [35],
"عِنْدَ": [[1,5,8,18,35,38]],
"berbolak-balik": [5],
"maha": [34],
"bahz": [27],
"بِمَا": [[1,4]],
"keterangan": [1],
"membatalkan": [8],
"bakr": [4,[15,33],[1,2,6,14,22,40]],
"يَدَيْ": [40],
"menyusul": [[1,4]],
"sabda": [[1,24,27,30,33]],
"يَدَيِ": [40],
"maka": [1,[4,28,33],[22,25,32],[10,12,14,29,34],8,[3,5,15,19,23,30,37,40],[9,11,18,20,24,31,38]],
"mulutku": [[12,19]],
"امْرَأً": [24],
"didepan": [33],
"وَإِنِّي": [[2,4,7,8]],
"diantara": [[25,26],[1,5,7,14,17,22,27,33,34,37]],
"مَيْمُونٍ": [23],
"عَلَيْهِمْ": [[1,5,9,17,23,33]],
"baju": [25],
"يُبْكِيكُمْ": [33],
"menyertakan": [[5,7]],
"مَضَاجِعَنَا": [1],
"يَبْكُونَ": [33],
"maju": [5],
"جَزَاكِ": [22],
"dua": [25,35,[1,5,40],[2,11,12,14,19,20,27,34]],
"بْنِأَنَسٍ": [3],
"فَضِيلَتَكَ": [4],
"بِشَاةٍ": [25],
"maje": [33],
"at-tayyah": [[20,23]],
"السَّرِيرُ": [34],
"فَأَعْطَاهُ": [1],
"الْآخِرَةِ": [31],
"rawahahnamun": [17],
"الْمَاجِشُونُ": [10],
"شِعْبًا": [[23,24]],
"فَكُنْتُ": [5],
"seorangpun": [[7,10,14]],
"mu\'minin": [[20,22]],
"الْخِيَارِ": [29],
"عَلَيْكَ": [[2,38]],
"bani": [29,37,5,[8,10,25,34]],
"فَسَمِعَتْ": [8],
"seolah": [32],
"دَنَا": [19],
"habban": [35],
"band": [37],
"عَوْنٍ": [[7,22]],
"ziyad": [[14,24]],
"berjihad": [[22,31]],
"وَيَتَجَاوَزْ": [33],
"لَمَّا": [22,[25,40]],
"مَلَكَيْنِ": [11],
"الْقِرَبَ": [40],
"بِي": [[2,10,11,12]],
"وَثَلَاثِينَ": [1],
"istriistri": [32],
"دُخُولِهِمْ": [23],
"قَطَعُوهُ": [10],
"مُسْهِرٍ": [5],
"sabarlah": [30],
"بَضْعَةٌ": [[4,8]],
"حَفْصُ": [19],
"فَسَأَلْتُهَا": [4],
"حَفْصٍ": [[5,29]],
"wasiat": [5],
"نَحْنُ": [[1,31]],
"فَهُوَ": [[1,4]],
"min": [38],
"jumlah": [25],
"diata": [[1,33]],
"فَقُلْنَ": [[22,32]],
"kepenatan": [1],
"terbaik": [5,[29,34]],
"تَلْقَوْنِي": [30],
"وَسَمْنٍ": [25],
"banu": [7],
"kakeknya": [25],
"الرَّبِيعِ": [25,8],
"alaihi": [1,[4,22],19,14,[12,25,29],[10,11,23,31,33,34],[5,8,9],[27,32],[6,24,26,30,40],[2,7,13,20,35,37,38],[16,17,18,21,28,36,39]],
"berdatangan": [27],
"أَمِينَنَا": [13],
"mana": [[12,25],[1,18,19]],
"untuk": [[22,30],15,[10,12,31,34,40],[0,1,3,4,5,6,19,25,27,32,33]],
"duduk": [[1,12,33]],
"bara": [34,[14,26]],
"دِمَاءِ": [23],
"وَشَوْا": [7],
"a\'laa": [13],
"إِمَّا": [[30,40]],
"وَضَلَّ": [7],
"الْأَرْضِ": [10],
"memancar": [35],
"قَوْسَيْنِ": [40],
"تَشُدُّ": [5],
"bermaj": [12],
"menempatkan": [29],
"وَالْمِطْهَرَةِ": [[12,19]],
"husain": [14,8,1],
"adapun": [5],
"الْمَاءُ": [32],
"semua": [1,25],
"أَنْتَ": [12,[19,40]],
"sekian": [22],
"ar-rabi": [[8,25]],
"sepotong": [32],
"وَبَيْنَهُمُ": [25],
"فَأُصِيبَ": [17],
"mengutarakannya": [10],
"semoga": [[1,25],[0,22]],
"mengeluhkan": [1],
"barakah-nya": [22],
"sesungguhnya": [[4,5,8,9,14,19,20,22,31]],
"أَخَذَهَا": [17],
"bata": [24],
"serupa": [[24,29]],
"لَخَلِيقًا": [9],
"berupa": [[4,23]],
"نَصْرٍ": [11],
"هِلَالٍ": [[17,35]],
"فَأُولَئِكَ": [32],
"إِذْ": [10],
"bagaimana": [[1,12,25],[19,23]],
"masa": [[11,25]],
"mentaati-nya": [22],
"تَقْطُرُ": [23],
"وَهَدْيًا": [19],
"tsulutsul": [7],
"فَإِنَّهُمْ": [33],
"mengikat": [33],
"hajjaj": [10,[14,26,33]],
"jika": [[1,15,23]],
"الْمُغِيرَةَ": [25],
"هَذَا": [10,1,[4,9,12,14,22,23,32]],
"الْمُغِيرَةِ": [12],
"melaksanakan": [20],
"baru": [19],
"وَهْبٍ": [11],
"sungguuh": [14],
"اللَّيْلَةَ": [32],
"dikuatkan": [7],
"بِهِ": [1,[7,9,14,18,23,28,32,38,40]],
"اللَّيْلَةِ": [1],
"لَأَنْ": [1],
"kekhusyu\'an": [19],
"شَيْبَانُ": [29],
"agar": [[22,28],[2,12,34,38]],
"الْخَيْرَ": [22],
"أَصِلَ": [4],
"denganku": [30,[10,22]],
"ketetapan": [34],
"وَكُنْتُ": [11,2],
"dipegang": [17],
"mengisahkannya": [11],
"يُصْلِحَ": [14],
"dimuliakan": [33],
"كَتَبَهُ": [10],
"wewangianku": [14],
"diberi": [34],
"الدُّنْيَا": [[14,22]],
"نَهَى": [20],
"istrinya": [32,22],
"بَيْنَنَا": [[1,25]],
"membaginya": [30],
"cangkan": [1],
"berikan": [25,[32,40]],
"صَوَاحِبِي": [22],
"فُلَانًا": [30],
"mata": [[1,17],40],
"mampu": [33],
"empat": [[1,18,19,36,39]],
"فَدَعَا": [[23,28]],
"mati": [1],
"cintai": [[9,27],[4,19]],
"انْقَضَتْ": [25],
"أَمَا": [5,[1,10]],
"sarung": [40],
"berpa": [1],
"hubungan": [4,14,[8,31]],
"وَالنَّبِيُّ": [9],
"حَيَاةِ": [11],
"رَأْسَهُ": [10],
"دَخَلْتُ": [19],
"firman-nya": [32],
"فَإِنِّي": [[1,10,34]],
"lisan": [12,19],
"فَسَمِعْتُهُ": [8],
"sudah": [25,19,[2,11,12,34]],
"دِينَارٍ": [[2,4,9,10,21]],
"مِنْهُ": [[1,22]],
"bawa": [1],
"ihram": [14],
"merabanya": [34],
"خَطَبَ": [[8,22]],
"وَلِيَ": [33],
"تِلْكَ": [[5,6]],
"قَوْمُكَ": [[8,23]],
"حَقِّ": [1],
"قُرَّةَ": [31],
"حَقَّ": [13],
"أُبَيٌّ": [39],
"pinangannya": [8],
"فَأْتُونِي": [1],
"أَنِّي": [[4,25]],
"kekhusyu\'annya": [19],
"terpecah": [23],
"حُمْرَانَ": [20],
"لَهُوَ": [23],
"orangnya": [5],
"عَلَيْهِ": [32,[1,5,33],[4,8,10,12,14,40]],
"التُّرَابَ": [[1,31]],
"التُّرَابُ": [1],
"خَدَمَ": [40],
"فَنَشُقُّهَا": [2],
"صَحِبْنَا": [20],
"فَلَمْ": [10,25,1],
"صِبْيَانِي": [32],
"الْأَنْصَارِ": [29,23,[24,25,26,37],[10,27,28,30,32,33,35,39]],
"الْأَنْصَارُ": [[23,25,28,33],[26,31]],
"تَزَوَّجْتَهَا": [25],
"الْوَحْيُ": [22],
"أَبَدَا": [31],
"بِيَدِهِ": [[4,5,27]],
"وَكُنَّا": [7],
"الزِّنَادِ": [25],
"radliallahu": [22,12,[1,4],[10,23],[9,14,30,33,34],[11,13,15,19,26,27,31],[2,3,5,7,16,17,20,21,25,29,32,35,36,37,38,39,40]],
"يَخْتَلِفُ": [5],
"radiallahuanhu": [14],
"kondisi": [23],
"وَأُبَيِّ": [[18,19,38]],
"tahanlah": [15],
"jadi": [40],
"الْأَنْصَارَ": [31,[23,24,29,30]],
"الشَّعْبِيِّ": [2],
"ذَاكَ": [1,[5,18,28,38]],
"يَضْحَكُ": [14],
"وَنَوِّمِي": [32],
"كَانَ": [22,2,[1,10],[5,9,11,14],[3,12,15,23,32,34,35,40]],
"bersaksi": [4],
"وَأُبَيٍّ": [36],
"hakam": [[1,5,22]],
"غُنْدَرٌ": [[1,30],[14,22,24,28,29,33,34,36,38]],
"مَلَؤُهُمْ": [23],
"وَأَعْطَى": [23],
"لِلنَّبِيِّ": [[22,34]],
"شَكْوَاهُ": [4],
"فَأَرْسِلُوا": [1],
"harmalah": [10],
"bisyir": [[20,35]],
"فَعَلَ": [23],
"kambin": [7],
"لَهُمُ": [30],
"حَلْحَلَةَ": [8],
"jabr": [26],
"لَهُمْ": [[4,33]],
"diberlakukan": [4],
"dipilih": [29],
"bukhariy": [10],
"الْأَعْرَجِ": [25],
"berdua": [1,32],
"بِاللَّيْلِ": [11],
"membacakan": [[2,38]],
"بِالْمَدِينَةِ": [4],
"فَاصْبِرُوا": [30],
"kepadanya": [1,[4,10],[5,12,14,25],[11,19,29]],
"a\'masi": [34],
"nashr": [11],
"تَعْرِفُ": [10],
"عَنْكُمْ": [23],
"أَيَّتُهَا": [13],
"diperoleh": [6],
"ذَرَارِيُّهُمْ": [34],
"meninggalnya": [34],
"في": [16],
"أَقْرَأَ": [38],
"keluargamu": [25],
"فَجَاءَ": [[1,22,34]],
"memperbaiki": [32],
"innaa": [3],
"mendampingi": [20],
"وَعِنْدَهُ": [20],
"أَبَا": [[1,14,19,28],[4,8,10,13,22]],
"mengunyah": [32],
"detail": [12,19],
"أَرْجُو": [19],
"teryata": [11],
"memilih": [[22,29]],
"وَفِيكُمُ": [12],
"قَدِمْتُ": [[12,19]],
"يَضَعُ": [7],
"سَبْعَةَ": [7],
"mengantarkannya": [4],
"عِكْرِمَةَ": [[16,33]],
"mencuri": [10],
"لَيْلَةٍ": [35],
"sedikit": [33,11],
"kehalusan": [34],
"membacakannya": [[12,19]],
"يُتِمَّ": [10],
"عَبَّادٍ": [10],
"النَّخْلَ": [25],
"ثِيَابَهُ": [10],
"وأَلْيَنُ": [34],
"مِنَّا": [28,33],
"يَأْكُلَانِ": [32],
"أُطَلِّقْهَا": [25],
"الْأَشْهَلِ": [29,37],
"keluargaku": [4],
"walimah": [25],
"بَعَثَ": [[9,22]],
"لي": [12],
"turunlah": [[3,22]],
"menyempurnakan": [10],
"melampaui": [24],
"penduduk": [7,[13,14]],
"وَدُخُولِ": [19],
"kuharap": [19],
"وَعَلَى": [22],
"berkunjung": [12,19],
"kitalah": [23],
"رُؤْيَا": [11],
"tetapi": [[22,23]],
"تُعَزِّرُنِي": [7],
"abdullah": [[18,19],[10,11],[3,12,14,22,38],[5,9,26],[1,2,4,15,17,25,30,32,36]],
"ikuti": [33],
"أَقْرَبَ": [19],
"hidup": [[0,11,31]],
"عَاتِقِهِ": [[5,14]],
"ema": [25],
"قَال": [[10,31]],
"حُبُّ": [26],
"menyambut": [[27,31]],
"بَيْنَهُ": [25],
"hartanya": [25],
"بِالْوَسْمَةِ": [14],
"antara": [12,[1,5,18,19,25]],
"shalallahu": [14],
"seraya": [[1,3,10,16,22,23,27]],
"membunuh": [14],
"tidurnya": [34],
"فَكَلَّمَهُ": [10],
"الْإِسْلَامِ": [7,[1,23,37]],
"قَرَابَتِي": [4],
"bubur": [22],
"bersabarlah": [30],
"أَبِي": [[1,19],[2,14,34],[4,5,6,20],[7,8,13,22,28,29,32,40],[3,10,12,15,18,21,23,24,25,31,33,36,38]],
"belaiu": [[1,29]],
"shahabat-shahabatku": [10],
"segala": [[0,14]],
"khalayak": [17],
"menghadapi": [[5,10]],
"وَجُرِّحُوا": [23],
"الْحُسَيْنِ": [14,8],
"بَكْرَةَ": [14],
"وَقَّاصٍ": [7],
"عَبَّاسِ": [29],
"سِرَاجَهَا": [32],
"عَبَّاسٍ": [20,[1,16,22,33]],
"طَعَامَهَا": [32],
"mengerjakan": [20],
"أَبُو": [4,[10,14,22,29,40],[2,12,15,23,24,25,33,34],[1,5,7,8,13,16,21,27,31,37,38,39]],
"غير": [16],
"bu\'at": [23],
"tangan-nya": [[4,5]],
"tetap": [[6,22,40]],
"bahwa": [22,[1,4,10],[2,14,34,35],[5,7,8,11,25,28,29],[3,13,15,17,19,21,32,38]],
"sambil": [14],
"وَالْمُهَاجِرَهْ": [31],
"فَضَحِكَ": [1],
"الشَّيْطَانِ": [12,19],
"فَأَدْرَكَتْهُمُ": [22],
"نِعْمَ": [11],
"كَرِشِي": [33],
"سَيِّدٌ": [14],
"urutan": [29],
"mengeluh": [22],
"دَعَاهَا": [4],
"فَإِنَّهُ": [20,[22,30]],
"لَيْلَتَهُمْ": [1],
"kedudukanmu": [1],
"diantaranya": [5],
"muliakanlah": [[31,32]],
"rumahnya": [[1,2]],
"أَرْسَلَتْ": [4],
"يُصَلِّيهَا": [20],
"fatimah": [21],
"مُوسَى": [[10,14,19],[1,7,16,22,23]],
"أُلْصِقُ": [2],
"bukan": [[12,16,19,24]],
"وُهَيْبٌ": [16],
"menjumpai": [29],
"khazraj": [29,[34,37]],
"لِأَمِيرِ": [1],
"mengabarkan": [14,5,[4,10],[1,33,35],[2,7,8,9,15,22,26,27,29]],
"عَنْهُ": [[19,32]],
"mendengar": [[7,14],[33,34],[19,22,29,30,38],[1,8,26,28],[4,5,10,20,23,25,27,31,36,37]],
"keringanan": [10],
"يَوْمَ": [5,[22,23],[7,31]],
"الْمَجِيدِ": [22],
"أَلَمْ": [29],
"langsung": [[19,40]],
"يُعْطَاهَا": [1],
"mendapatkannya": [1],
"rendah": [10],
"perangainya": [19],
"يَوْمُ": [[23,40]],
"آدَمُ": [31,[22,28]],
"kerabat": [8,4],
"قُوتُ": [32],
"بِغَيْرِ": [22],
"ummat": [13,33],
"itulah": [[1,32]],
"أَحَبَّهُمْ": [26],
"jabal": [[18,36],[19,38,39]],
"فَجَعَلَنَا": [29],
"وَفَدَكٍ": [4],
"jaliisan": [12],
"وَيَعْجَبُونَ": [34],
"نَأْخُذَ": [19],
"أُدْخِلُ": [5],
"الْقَاسِمِ": [[22,24]],
"تَقْدَمِينَ": [22],
"perkataan": [23],
"وَالْمُهَاجِرَةَ.وَعَنْ": [31],
"رَأَيْتُ": [14,[6,40]],
"وَكَانَتْ": [10],
"الْحَارِثَ": [5],
"الْحَارِثِ": [29,[14,37]],
"أَكْثَرُ": [25],
"أَكْثَرَ": [2],
"بِوَاحِدَةٍ": [20],
"يَرْجِعَ": [23],
"مِنِّي": [[1,4,8,21]],
"مَرَّ": [33],
"sesekali": [14],
"بِهَدَايَاهُمْ": [22],
"قَيْسٍ": [[7,15]],
"بْنِ": [14,34,[10,38],[18,19],1,[5,7,22,25,29,30],[3,4,8,15,21,26,33,36],[2,6,9,17,20,24,27,28,31,32,37]],
"قَيْسِ": [6],
"alhikmah": [16],
"يَمْسَحُ": [1],
"نِسَائِهِ": [[22,32]],
"بْنَ": [7,[8,30],[1,3,5,9,10,14,19,20,22,25,27,28,31,33,35,37]],
"بْنُ": [10,[5,14],22,1,7,[2,9,19,29],25,[4,13,20,23,33,34,35],[3,26,27,30,39],[8,11,12,15,17,28,31,38],[6,18,24,32,36,37]],
"mimpiku": [11],
"mempersembahkan": [23],
"bekerja": [1],
"berkata": [1,14,22,10,5,19,25,[7,29],34,[4,12,23,28],[27,30,32,33],9,[8,11,20,26,38],[13,15,18,31,37,40],[2,6,35],[3,16,24]],
"musuh": [40,[5,8]],
"lukatusukan": [5],
"لِأَقُومَ": [1],
"zubair": [5,4],
"kurang": [7],
"بَلَى": [12],
"يَرْجِعْ": [25],
"لِإِخْوَانِنَا": [30],
"bergetar": [34],
"فَإِنَّ": [[33,34]],
"يَفْتَحُ": [1],
"فَقَرَأْتُ": [[12,19]],
"وَبِهِ": [25],
"istri": [[22,32],25],
"وَكَذَا": [23],
"قَدِ": [28],
"keberadaan": [33,40],
"قَدْ": [[1,28,29,37],[4,6,11,12,25]],
"وَبَيْنَكَ": [25],
"تُؤْذِينِي": [22],
"sembuh": [1],
"مَنْ": [10,[5,12,32,39]],
"حِرْصًا": [22],
"hurairah": [[2,24],[25,32]],
"إِنْسَانٌ": [10],
"kuperangi": [1],
"kedatangan": [1],
"فَقَصَّتْهَا": [11],
"islam": [7,[1,23,37]],
"مَطْوِيَّةٌ": [11],
"يَعْلَمُهُ": [[12,19]],
"ladziina": [38],
"يَنْكُتُ": [14],
"mu\'ad": [34],
"حُمْرُ": [1],
"hak-hak": [[1,4]],
"آخَى": [25],
"sya\'ir": [31],
"prinsip": [1],
"perangai": [19],
"عَوَانَةَ": [34,19],
"berjanji": [8],
"sebentar": [25],
"يَنَامُ": [11],
"أَصْحَابِهِ": [22],
"لَخَيْرُهُمْ": [5],
"bapaknya": [[5,22],1,[4,6,7,14,23,25,31]],
"فُلَانٌ": [[1,2]],
"bukair": [22],
"سَمَّاهُ": [1],
"bangun": [1],
"ambillah": [[18,19,36,38]],
"الْعِشَاءِ": [20],
"نَرْجُوهُ": [1],
"التَّيَّاحِ": [[20,23]],
"berharap": [[1,11]],
"أَمْرٌ": [22],
"kebaikannya": [14],
"تَغْضَبُ": [8],
"قَزَعَةَ": [[4,9]],
"سِهَامِ": [40],
"أَرَى": [[11,22,29,37,40]],
"rasulullah": [22,1,4,10,[8,11,25],[5,31,32],[12,14,19,23,29,37],[2,6,13,18,20,21,27,28,30,33]],
"أَحَبَّ": [1],
"أَحَبُّ": [[4,27]],
"أَحَبِّ": [9,27],
"مِثْلَهُ.والحكمة": [16],
"remaja": [11],
"penyusunan": [0],
"ayat": [[2,22,32]],
"نُورٌ": [35],
"rumah": [22,[19,25,35]],
"hushain": [1],
"وَجَعِهِ": [4],
"isma\'il": [[5,22,23,25],[2,7,10,12,15]],
"kekeluargaan": [4],
"تَسْتَعْمِلُنِي": [30],
"رَأَيْنَاهُ": [20],
"قِيلَ": [20],
"قَالَقَالَ": [1],
"الرَّكْعَتَيْنِ": [20],
"أُمَّ": [22],
"أُمُّ": [[10,22]],
"أُمِّ": [10,19,[12,22]],
"muawiyah": [20],
"بَطْنِي": [2],
"حَيْثُمَا": [22],
"ilaika": [3],
"menjadi": [28,[1,24],[4,6,10,14,22,25,29,33,35]],
"ayah": [[9,40]],
"yaitu": [12,[0,10,15,18,19,20,36,38]],
"berwudlu": [22],
"أَنَّهَا": [22],
"qur\'an": [[18,19]],
"فَتَمْلَآَنِهَا": [40],
"هَمَّامٍ": [25],
"katanya": [22],
"أَثَرِ": [1],
"jarir": [[14,23]],
"الْعَصْرِ": [20],
"أَثَرُ": [25],
"هَمَّامٌ": [35],
"فَصَلَّوْا": [22],
"mematikan": [32],
"صَدْرِهِ": [16],
"فَلَمَّا": [[1,22],5,[10,12,19,32,34]],
"عَنِّي": [22],
"kalau": [[7,24]],
"بَلَغَ": [34],
"panggilan": [1],
"hafal": [[2,12]],
"تَرْجِعَانِ": [40],
"balasan": [22],
"لَمِنْ": [9],
"mahar": [25],
"فَاطِمَةُ": [[4,8,10,21]],
"terimalah": [33],
"فَاطِمَةَ": [1,4,8],
"سَائِرِ": [22],
"وَلَّى": [10],
"يُوقَ": [32],
"يَجْعَلَ": [28],
"الْحِكْمَةَ.حَدَّثَنَا": [16],
"قِلَابَةَ": [13],
"فَضَحِكْتُ": [4],
"أَمَّا": [[8,33]],
"disampaikan": [[0,4]],
"فَحَمَلَ": [5],
"أُمَّةٍ": [13],
"فَيَأْتِينِي": [5],
"kesayangan": [10],
"زيد": [10],
"أَلَيْسَ": [12],
"قَضَوْا": [33],
"datang": [1,22,5,25,[7,9,12,19,27,31,32,34]],
"mensucikan-nya": [33],
"mughirah": [12,[19,25]],
"الْمَالِ": [[4,25]],
"wal": [12,19],
"إِيَاسٍ": [31],
"مَاذَا": [1],
"wan": [12,19],
"مَجْلِسَ": [33],
"hisyam": [5,22,[14,23,27,30,33]],
"idzaa": [12,19],
"إليها": [25],
"sungguh": [7,[4,12],[1,5,9,19,20,34],[2,8,11,13,14,22,24,27,40]],
"kunna": [3],
"shalatnya": [7],
"apabila": [[10,25],[22,40]],
"menggendong": [14],
"إِنَّا": [[3,4]],
"karenanya": [4,33],
"حَمَّادُ": [17],
"الْمَلِكِ": [34],
"حَمَّادٌ": [[22,35]],
"kemana": [1],
"مَجَالِسِ": [33],
"فَخَرَجَ": [1,33],
"arqam": [28],
"rasul-nya": [[1,23]],
"الْأَحْزَابِ": [5],
"rafi": [1],
"طَلْحَةَ": [40,6],
"وَمَالِكَ": [25],
"ubaidilah": [14],
"suka": [[1,8,19]],
"dialah": [38],
"الْعَرَبِ": [7],
"silakan": [25],
"far": [2],
"umumnya": [1],
"وَلَعَلَّ": [14],
"نَعَمْ": [5,[1,38]],
"shallaallu": [20],
"membencinya": [26],
"rampasan": [23],
"banyak": [25,33,[2,14,17,22,32]],
"فَيَقُولُ": [[1,40],[10,23]],
"ibunya": [[10,19]],
"الْوَهَّابِ": [22,[4,7]],
"عزبا": [11],
"الْأَزْدِ": [23],
"sediri": [15],
"بِخَبَرِهِمْ": [5],
"حَتَّى": [1,[25,30],[12,17,19,33],[2,5,7,35]],
"mengangkat": [[9,40]],
"munafiq": [26],
"memperbin": [1],
"peranguhud": [40],
"akuwasiatkan": [33],
"berangkat": [5],
"matanya": [1],
"يَضُرُّ": [33],
"عُرُسٍ": [27],
"الْمَدِينَةَ": [25],
"إِنِّي": [14,[7,12,22,25]],
"الْمَدِينَةِ": [1],
"mematahkan": [40],
"komando": [1,17],
"يَسِيرًا": [25],
"menjamu": [32],
"مَرْوَانَ": [5],
"قَالَهَا": [27],
"لِلْمِسْكِينِ": [2],
"kitab": [[0,1,10,16]],
"kecintaan": [10],
"menamakannya": [1],
"dzat": [[4,5,27]],
"syu\'aib": [[4,8]],
"أَقُصُّهَا": [11],
"ragu": [25],
"الْحَوْضُ": [30],
"الْحَوْضِ": [30],
"turab": [1],
"مَعَ": [[6,7,10]],
"egoism": [30],
"تَجَلَّى": [12,19],
"kufah": [[7,12],[19,22]],
"suku": [[5,10,23,34]],
"وَعَيْنَاهُ": [17],
"kemari": [1],
"وَهَذَا": [8],
"menjaga": [[4,14]],
"النِّفَاقِ": [26],
"menghafalnya": [19],
"التَّيَمُّمِ": [22],
"tidalah": [22],
"raja": [34],
"سَرَقَ": [10],
"الْأَعْلَى": [13],
"خِبْتُ": [7],
"فَأَتَى": [[1,20]],
"mengambil": [19],
"وَأَعْجَبَهُ": [9],
"مِثْلَنَا": [1],
"ayman": [10],
"halhalah": [8],
"ubay": [38,18,[19,36,39]],
"tajallaa": [12,19],
"senantiasa": [[12,18,20,38]],
"شَلَّتْ": [6],
"الشَّأْمِ": [12],
"seingatku": [14],
"khuthbah": [[10,22]],
"يَمَسُّونَهَا": [34],
"fulan": [[1,30]],
"الشَّأْمَ": [[12,19]],
"بُنَيَّ": [5],
"samin": [25,2],
"عِمْرَانَ": [22],
"وتحمدان": [1],
"ahli": [[4,14]],
"آيَةُ": [[22,26]],
"مُسَاوِرٍ": [34],
"menikahi": [8],
"hari-hari": [6],
"musayyab": [7],
"سَمِعَا": [34],
"dicintai": [5],
"يَكْثُرُونَ": [33],
"إِلَى": [[1,12],32,[5,14,22,23,30],[4,7,10,11,16,19,27,28,34,40]],
"utsrah": [30],
"ذَهَبْتُ": [10],
"ahlu": [[4,19,28]],
"يسؤوك": [1],
"مَعِي": [2],
"kenabian": [16],
"mengajari": [7],
"يُبْغِضُهُمْ": [26],
"مِثْلَهُ": [[31,34]],
"menggali": [31],
"hidangan": [32],
"nya": [[9,19]],
"الْخَطَّابِ": [3],
"allimhu": [16],
"حَوَارِيًّا": [5],
"أَمِينٍ": [13],
"الْحَدِيثَ": [1],
"مَلَكٌ": [11],
"أَرْبَعًا": [1],
"kembali": [[4,5,23,25],[22,32]],
"melihat-lihat": [5],
"آخِرًا": [29],
"بَكْرٍ": [4,[14,15],[2,6,22,33,40]],
"جَاءَتِ": [27],
"هَارُونَ": [[1,2]],
"giliran": [22],
"فَقِيلَ": [[29,37]],
"keju": [25],
"أَثَرَةً": [30],
"أَثَرَةٌ": [30],
"رَيْحَانَتَايَ": [14],
"أَمَرَنِي": [38],
"hilir": [2],
"مَعَكَ": [5],
"وَأَصْبِحِي": [32],
"ab": [7],
"كَأَنَّهَا": [32],
"قُرَيْشٍ": [[5,23]],
"ad": [[7,34]],
"mengenai": [40,[1,5]],
"ath-thawil": [31],
"ah": [40],
"al": [14,10,[5,34],[3,22],[8,19],[1,4,7,12,20,29,33],[2,15,16,21,23,25],[6,13,17,18,24,26,30,37,38]],
"keji": [19],
"سَالِمٌ": [11],
"pasukan": [9],
"بَيْنِي": [25],
"yaghsyaa": [12,19],
"merundingkan": [10],
"az": [5,10,[4,11,14],[8,9,25,34]],
"memudahkanaku": [12],
"tinggalkan": [4],
"فَفَتَحَ": [1],
"عَمَلِهِ": [1],
"قَرْنَانِ": [11],
"عُبَادَةَ": [29,37],
"bn": [[12,29]],
"ابْنَتَهُ": [4],
"meminang": [8],
"طَاوِيَيْنِ": [32],
"سَالِمٍ": [11],
"hatimu": [25],
"بَايَعُوا": [31],
"عَبْد": [10],
"إِلَيْهَا": [25],
"ثَابِتٌ": [35],
"ثَابِتٍ": [[26,35,39]],
"mu\'adz": [34,18,[19,36,38,39]],
"kemudian": [29,1,12,[19,32],[4,37],[3,5,10,11,17,22,23,28,33],[7,13,14,18,27]],
"يُقْبَضُ": [4],
"عَجِبَ": [32],
"مُقْبِلِينَ": [27],
"mendengarnya": [14],
"فَتَحَ": [17],
"وَيُقْبِلُ": [23],
"menurut": [28],
"تَرْضَوْنَ": [23],
"da": [14],
"فَاجْتَمَعَ": [22],
"harinya": [1,32],
"fir\'aun": [22],
"beranjak": [1],
"di": [1,22,[5,12,30],[10,11,23],[4,19,25,40],[2,7,14,17,18,20,24,31,33,34,35,37,38]],
"فَذَهَبَا": [11],
"sekalian": [[13,33]],
"أَصْبَحَتْ": [7],
"merubah": [4],
"meriwayatkan": [10],
"tetaplah": [1],
"مَحَاسِنِ": [1],
"karuniakan": [4],
"kedalam": [14],
"مَرْوَانُ": [5],
"فَضَّلَكُمْ": [[29,37]],
"kepalanya": [33],
"الْقِدِّ": [40],
"mu\'awiyah": [20,31],
"وَقَالَ": [14,[16,19,29,35],[1,10,31]],
"خَرَجَا": [35],
"الْعَوَّامِ": [5],
"mencela": [9],
"فَصَاحَ": [10],
"حُسَيْنٌ": [1],
"setiap": [[28,29],[5,13,37]],
"حُسَيْنٍ": [[8,14]],
"يَدَ": [6],
"حُسَيْنُ": [14],
"فَقِيهٌ": [20],
"يُحْسِنُ": [7],
"selanjutnya": [5],
"يَدَهَا": [10],
"رَأْسِهِ": [33],
"لَأَوَّلُ": [7],
"sia-sia": [7],
"قَالَا": [14],
"ذُكِرَ": [[18,38]],
"الْبَحْرَيْنِ": [30],
"belliau": [33],
"كُنْتُمْ": [[1,9,23]],
"pergi": [[1,10,15,30]],
"لِلْأَنْصَارِ": [[30,31]],
"memanah": [40],
"makhramah": [[4,8,21]],
"terus": [[25,31,33]],
"الرحمن": [26],
"بُغْضُ": [26],
"jauhkan": [12,19],
"sebuah": [[10,22]],
"juhaniy": [2],
"minhal": [[14,26]],
"فَذَكَرَ": [1,10],
"غَدَوْا": [1],
"مَخْرَمَةَ": [[4,8,21]],
"mengutus": [13,[4,9,22,34]],
"singgah": [1],
"عَمِلَ": [4],
"atsarah": [30],
"عُثْمَانَ": [5,[1,6,10,14,20]],
"دُونَ": [40],
"عُثْمَانُ": [5],
"rabah": [15],
"kuganjal": [2],
"مُنَافِقٌ": [26],
"hadit": [10,[1,7,16,29,31,34]],
"hadis": [0],
"bagaikan": [22,[7,11,33]],
"عُمَر": [7],
"ia": [1,[4,10,12,23,29]],
"id": [14],
"hilal": [[17,35]],
"khalid": [[6,16,17],[2,4,5,7,9,13,29]],
"وَرَحْمَةُ": [22],
"anak-anak": [[5,27,34]],
"طَسْتٍ": [14],
"minyak": [25,2],
"memalingkan": [12],
"رَضِيَ": [32],
"سَأَلَهُ": [1],
"disebabkan": [34],
"terhadap": [22,[1,2,4,10,37]],
"bagus": [[2,7,25]],
"فَجَعَلَا": [32],
"ja": [2],
"memintanya": [4],
"anshar": [29,25,23,31,33,[24,26,28,30],32,[27,37],[10,35,39]],
"buang": [7],
"clarisa": [0],
"قَامَتْ": [32],
"hammad": [17],
"kere": [7],
"أُحِبُّهُمَا": [[10,14]],
"kasrah": [[12,19]],
"أَوْسَطُ": [1],
"ditinggalkan": [4],
"يَقْرَأُ": [12],
"hammam": [[25,35]],
"أَتَخَلَّفُ": [1],
"إِبْرَاهِيمَ": [12,[1,2,7,13,14,18,19,26,27,34,36,38]],
"أَمُوتَ": [1],
"urusan": [33],
"رَسُولَ": [22,1,4,[2,8,13,18,19,20,21,25,28,29,30,37]],
"رَسُولُ": [[22,25,31],[1,5,10],[4,6,8,12,23,27,32,33,37]],
"رَسُولِ": [[1,4,32],[5,8,10,12,14,22,27]],
"إِبْرَاهِيمُ": [25,[4,7,9,14,19]],
"مُغِيرَةَ": [[12,19]],
"diambil": [[1,17]],
"muthalib": [3],
"diri": [32],
"ka": [38],
"سُيُوفَنَا": [23],
"ke": [23,12,[10,11,14,16,19,22]],
"كَثِيرٌ": [22],
"كَثِيرٍ": [[27,29,37]],
"كَثِيرَ": [25],
"keluarnya": [22],
"berbaring": [9],
"مِنْهَالٍ": [26],
"وَأَنَا": [[5,7,22]],
"السِّوَاكِ": [12],
"ucapan": [24],
"عَلِمَتْ": [25],
"يصبك": [40],
"hawariy": [5],
"بِشَيْءٍ": [4],
"وَعُمَرُ": [5],
"dikembalikan": [23],
"shahih": [0],
"imran": [22],
"الْيَوْمِ": [[7,33]],
"usul": [9],
"الْأَنْصَارِيُّ": [3],
"coba": [1],
"وَاحِدٍ": [8],
"وعملي": [15],
"مَعَهُ": [[30,40]],
"الْآيَةَ": [2],
"dada": [16],
"halus": [34],
"أَحَدًا": [[19,33]],
"اللَّيْثُ": [22],
"مُتَفَحِّشًا": [19],
"kekeluargaannya": [4],
"mengajak": [32],
"mu": [[14,34,36]],
"آوَوْهُ": [24],
"mengangkut": [31],
"qilabah": [13],
"sedang": [[1,10,14],[9,31,33]],
"جَمَعَ": [[5,7,39]],
"dipersembahkan": [23],
"لِأُمِّهِ": [10],
"syu\'bah": [[1,14,22,28],[19,26,29,30,31,33,34,38],[4,12,13,18,20,23,24,27,36,37,39]],
"jawaban": [19],
"perisainya": [40],
"memuji": [33],
"سُقْتَ": [25],
"dipelihara": [32],
"بِحَجَفَةٍ": [40],
"انْطَلِقْ": [1],
"beliau": [22,1,4,14,[8,10,25,33,34],[19,23,27,32],[24,29],[13,16,17,18,20,30,31,38,40],[5,7,9,11,12,28,37]],
"kegelisahan": [22],
"أُوصِيكُمْ": [33],
"هِشَامٍ": [22,[5,23,30]],
"yazid": [19,[1,2]],
"هِشَامُ": [5,[14,27]],
"sendiri": [30,[4,32]],
"هِشَامِ": [[5,33]],
"لله": [15],
"هِشَامٌ": [22],
"نَاكِحٌ": [8],
"berselimut": [33],
"فَوَجَدَ": [1],
"أَصْحَابِي": [[1,10]],
"بِأَبِي": [[14,24,40]],
"دَخَلَ": [[1,9,10,12]],
"وَسَالِمٍ": [[18,19,36,38]],
"darinya": [[19,20,34]],
"menahan": [2],
"mengira": [27],
"فَانْطَلَقَ": [32],
"مِمَّنْ": [12],
"وَأَوْصَى": [5],
"عَائِشَ": [22],
"تُقْطِعَ": [30],
"سَمِعَ": [[14,22,29,30]],
"aroma": [14],
"يستنزلونني": [12],
"لِيَسْتَنْفِرَهُمْ": [22],
"صَالِحٍ": [34],
"صَالِحٌ": [11],
"salah": [[5,19,28,33,39]],
"ditanyaan": [20],
"salam": [22,[0,1,2],4],
"ayahnya": [9],
"awanah": [34,19],
"minta": [1],
"pula": [[9,15,17,22,28,29,39]],
"بَنُو": [29,37,7],
"الْإِيمَانِ": [26],
"فَصَعِدَ": [33],
"فَبَلَغَ": [23],
"muqaddamiy": [6],
"يَجِبُ": [1],
"تَرَى": [22],
"kehendaki": [22],
"سِرِّ": [12],
"aturan": [10],
"qs": [32],
"الْحَيَّيْنِ": [34],
"فَأَتَيْتُ": [12],
"nu\'im": [15],
"kalinya": [22],
"merangkulnya": [10],
"bi\'ammi": [3],
"memain-mainkannya": [5],
"بُعَاثَ": [23],
"yakunil": [38],
"puji": [0],
"allahumma": [27],
"أَيُّهَا": [33],
"لَأَسْتَقْرِئُ": [2],
"يَدَيْهِ": [1],
"witir": [20],
"dage": [22],
"buatmu": [1],
"بِرَسُولِ": [[14,23]],
"آلُ": [4],
"wadah": [2],
"لَيْلَى": [28,1],
"ro": [[12,19]],
"يَلْبَثْ": [25],
"kemauanmu": [15],
"berbincang": [27],
"فَيُطْعِمَنِي": [2],
"tertingg": [1],
"أَصْحَابُهُ": [[13,34]],
"musaddad": [[6,14,16,32]],
"sebagai": [[22,40],[0,4,5,7,9,12,19,29]],
"وَفِي": [29,37],
"sa": [[7,14,34,37]],
"kesamaan": [19],
"azdi": [23],
"si": [[1,30]],
"أَقِطٍ": [25],
"تَشَهَّدَ": [8],
"minum": [40],
"فَأَطْفَأَتْهُ": [32],
"kemenangan": [1,17],
"بَنِي": [29,[5,10],[8,25]],
"طَالِبٍ": [[1,2]],
"جَبْرٍ": [26],
"مِيرَاثَهَا": [4],
"لِينِهَا": [34],
"ti": [[10,22]],
"mengen": [[10,11]],
"الرِّجَالِ": [22],
"kuputuskan": [34],
"انْفُذْ": [1],
"مَهْدِيُّ": [23],
"melepaskan": [7],
"pemimpin": [[9,14,22,23,34]],
"مُمْثِلًا": [27],
"ud": [19],
"اللَّيْلِ": [11],
"disebut-sebut": [38],
"يَنْظُرُ": [[14,40]],
"أبو": [29],
"janjinya": [8],
"يَنْقَلِبَ": [2],
"يَنْقَلِبُ": [2],
"يُحَدِّثُ": [4],
"دُورِ": [29,37],
"دُورُ": [29],
"bapakku": [14,[3,4,5,10,19,33]],
"sabdakan": [14],
"menyerang": [5],
"فَكَلَّمَهَا": [27],
"وَأَمَّرَ": [9],
"mendo\'akannya": [[1,28]],
"bukhari": [0],
"nahaari": [12,19],
"سَأَلْنَا": [19],
"الرَّجُلَ": [2],
"zaid": [10,[9,28,39],17,[14,27,33]],
"الرَّجُلُ": [11,40],
"warisan": [4],
"أَحَبَّهُ": [26],
"عَدِيٌّ": [14],
"pasar-pasar": [25],
"لَا": [31,[4,8,12,18,22,30],[2,7,11,19,23,25,26,38,40]],
"سُوقِ": [25],
"wa": [22,[4,8,9,24,25,27,30,31,33]],
"نَتَوَسَّلُ": [3],
"الْمِسْوَرَ": [8],
"miswar": [8,[4,21]],
"الْمِسْوَرِ": [[4,21]],
"مَهْيَمْ": [25],
"kepada": [22,1,[10,14,23],[5,33],4,28,[7,11,25],[19,27,29,30,31,34],[13,20],[2,12,15,16],[9,35,38,40],[3,6,17,26,32,37],[24,39],[0,8,18,21,36]],
"sa\'idah": [29],
"أَتَعْجَبُونَ": [34],
"وَإِلَيْهِ": [14],
"فَنَزَلَتْ": [22],
"عَدِيُّ": [26],
"pekerti": [23],
"selama": [31],
"hidupnya": [19],
"مُصَاهَرَتِهِ": [8],
"menambahkan": [[8,25]],
"وَنَقَرَ": [10],
"كَمَلَ": [22],
"seketika": [1],
"selalu": [[2,18,38]],
"ضَرْبَتَيْنِ": [5],
"الْأَسْوَدُ": [19],
"الْأَسْوَدِ": [20],
"أَبْغَضَهُمْ": [26],
"mengatakannya": [1],
"memanggil": [[1,4,23,30]],
"anakku": [[5,14,32]],
"salim": [[11,18],[19,36,38]],
"persatuan": [1],
"cintailah": [14,10],
"اقْسِمْ": [25],
"aziz": [1,[5,15,22,27,40]],
"ya": [[5,31],[1,12,14],[3,10,16,19,28,38]],
"memberkahimu": [25],
"mengerahkan": [22],
"problem": [22],
"baligh": [7],
"فَجُعِلْنَا": [29],
"memanggilnya": [1,[4,34]],
"kampung": [29,37],
"لِي": [12,[5,7,8,10,11,19,25]],
"نَبِيِّهِ": [12],
"berwarna": [33],
"perkara": [1,23],
"kasur": [12],
"كَفَرُوا": [38],
"fa\'i": [4],
"mengikuti": [28,[15,22,35]],
"dirasakannya": [1],
"رَكْعَتَيْنِ": [[12,19]],
"sangat": [[22,40]],
"anakmu": [32],
"أَغْضَبَهَا": [[4,21]],
"berlindung": [11],
"manfaat": [[19,33]],
"سُوقُكُمْ": [25],
"yusuf": [[14,19]],
"hamid": [22],
"ضَيْفَ": [32],
"عِنْدَكُمْ": [12],
"وَعَلَيْهِ": [33,[22,25]],
"penaklukan": [23],
"melalui": [12,[0,19]],
"selain": [[19,32]],
"حَفْصَةُ": [11],
"مَوْلًى": [[10,20]],
"حَفْصَةَ": [11],
"menyusahkanmu": [1],
"dari": [1,[14,22],4,10,19,12,34,[11,33],25,[5,29],[8,31],[2,7,18,30,32,35,36],[9,16,23,28],[6,13,20,21,38,39],[15,17,24,26,40],[3,27]],
"usman": [5],
"duduklah": [1],
"maukah": [1],
"أَيُّوبُ": [10],
"أَيُّوبَ": [[1,17]],
"ka\'ab": [[18,19,36,38]],
"awwam": [5],
"terluka": [40],
"فَوَجَدَتْ": [1],
"هَاشِمٌ": [7],
"kotor": [19],
"هَاشِمٍ": [7],
"هَاشِمُ": [7],
"هَاشِمِ": [7],
"وَإِنْ": [[2,5,9,15]],
"جَاءَنَا": [31],
"الْعَاصِ": [8],
"mendapatkan": [1],
"فَأَعْرَضَ": [22],
"lembah": [[23,24]],
"kabur": [40],
"shalawat": [0],
"وَالزُّهْرِيُّ": [34],
"هَؤُلَاءِ": [[12,19,34]],
"faqih": [20],
"تكفوننا": [25],
"lampu": [32],
"لَكُمَا": [1],
"أَخَذَ": [17],
"bersama": [12,19,[1,6,7,10,22,27,32,35]],
"امْرَأَةٌ": [27],
"امْرَأَةً": [[10,25]],
"الْأَعْمَشِ": [34],
"semula": [17],
"beriman": [26],
"وَقُتِلَتْ": [23],
"menyebut": [[4,5,18,38]],
"خِلْطٌ": [7],
"تُسَمَّوْنَ": [23],
"فَأَصْلِحْ": [31],
"الْحَبِيرَ": [2],
"zuhriy": [10,[11,14],[4,8,9,34]],
"kebenaran": [16],
"bermulazamah": [2],
"meminjam": [22],
"امْرَأَةُ": [22],
"campurannya": [7],
"فَأَثْنَى": [8],
"امْرَأَةٍ": [22],
"مَوْلَى": [[10,18,19,36,38]],
"أَحِبَّهُمَا": [10],
"yahya": [[4,7,9,11,14,22,29,30,33,39]],
"أَبَوَيْهِ": [[5,7]],
"bendera": [1,17],
"tanpa": [22],
"قُتَيْبَةُ": [1,[10,25]],
"ath-thalhiy": [29],
"فَأَجَابَهُمْ": [31],
"الْخِطْبَةَ": [8],
"ذَلِكَ": [[22,28],[1,4,23,33]],
"الْعِرَاقِ": [14],
"فَبَعَثَ": [[13,32]],
"قَرِيبًا": [34],
"kepala": [[33,40],10],
"ya\'qub": [[14,27,33]],
"panah": [40,7],
"berdirilah": [34],
"seseorang": [[1,33],[2,10,11,16,18,30,34]],
"menjelaskan": [[0,4]],
"digendong": [14],
"فَأَمْسِكْنِي": [15],
"daud": [32],
"belah": [23],
"bersya\'ir": [31],
"buat": [[1,2,22,29,34]],
"belau": [[10,22]],
"مِثْلَهَا": [30],
"kafaruu": [38],
"keutamaan": [22,[0,1,4,29]],
"فَيُسْقَوْنَ": [3],
"فَحَمِدَ": [33],
"semuanya": [[4,39]],
"janganlah": [[11,22,40]],
"berpisah": [35],
"قَوْمٍ": [28],
"membenc": [26],
"خَيَّرَ": [29],
"قَدِمُوا": [25],
"بِسَاحَتِهِمْ": [1],
"بِالْأَنْصَارِ": [33],
"وَإِذَا": [11,[10,35]],
"الزُّهْرِيَّ": [10],
"الزُّهْرِيِّ": [10,[11,14],[4,8,9]],
"dekat": [[5,19],[10,34,40]],
"iddahnya": [25],
"daripada": [14],
"وَنَوَّمَتْ": [32],
"hujan": [3],
"begini": [23],
"شَمْسٍ": [8],
"setelah": [[20,33],[5,9,11,14]],
"سَلَمَةَ": [22,5,[1,15,29]],
"فِدَاكَ": [5],
"wanita-wanita": [22],
"yunus": [[11,22]],
"sere": [19],
"وَالْأَنْصَار": [31],
"ditempuh": [[23,24]],
"يَرْجُو": [1],
"arah": [14],
"memegang": [9],
"budi": [23],
"شَطْرَيْنِ": [25],
"arab": [7],
"مِنَ": [11,[12,14,19,22],[2,4,10,29,34,40]],
"saudara": [[10,11,19,33]],
"وَكَانُوا": [[7,23]],
"مِنْ": [[19,25],[1,4],[12,33],[27,38],[9,10,18,22,23,30,32,34,35,36,40],[5,8,14,17,24,28,39]],
"إِمَارَتِهِ": [9],
"mengelisahkan": [10],
"أَسْمَاءَ": [22],
"امْرَأَتِهِ": [32],
"shallallahu": [1,4,22,19,[12,25,29],[10,11,14,23,31,33,34],[5,8,9],[27,32],[6,24,26,30,40],[2,7,13,35,37,38],[16,17,18,20,21,28,36,39]],
"pembantu": [1],
"diriwayatkan": [[1,22,34]],
"ayahku": [5],
"مَرَضِهِ": [22],
"كَطَيِّ": [11],
"فَجَعَلْتُ": [11],
"حُسْنِهِ": [14],
"عُتْبَةَ": [7],
"جبل": [18],
"فَتَفَرَّقَ": [35],
"أُثْرَةً": [30],
"مِنْهَا": [34],
"madinah": [[1,4,23,25]],
"tsumamah": [3],
"وَإِنَّهُمَا": [40],
"sebut": [25],
"لِسُفْيَانَ": [10],
"بِمَنْزِلَةِ": [1],
"gugur": [17],
"وَأُسَامَةُ": [9],
"مُضْطَجِعَانِ": [9],
"ajarkanlah": [16],
"مُتُونِهِمَا": [40],
"بِاللَّهِ": [11],
"أَلْبَسُ": [2],
"menyanjung": [[13,29,37]],
"bahrain": [30],
"الْبَعِيرُ": [7],
"أَتْبَاعًا": [28],
"رَامِيًا": [40],
"masih": [[5,11,19,33]],
"khaibar": [[1,4]],
"tebusan": [5],
"dijadikan": [34],
"أُقَاتِلُهُمْ": [1],
"إِلَيْهِ": [1,22,34],
"kedudukan": [1],
"الْعَلَاءِ": [19],
"صَبَاحِهَا": [1],
"kepadamu": [22],
"وَنَحْنُ": [31],
"الَّذِينَ": [[31,38]],
"فَسَأَلَهُ": [1],
"bakar": [[4,14]],
"إِلَيَّ": [[9,27],[4,19,22]],
"pulang": [23,32],
"فَادْعُ": [28],
"قَدَّمَهُ": [23],
"mulutnya": [32],
"ataupun": [0],
"ضَحِكَ": [32],
"اشْتَكَتْ": [22],
"فَهَلَكَتْ": [22],
"الطَّوِيلِ": [31],
"أَنَسِ": [[14,26,29,30,31,33,38]],
"pengganti": [5],
"sampingku": [12],
"وحَدَّثَنَا": [[10,22]],
"سَيَكْثُرُونَ": [33],
"tusukan": [5],
"bercerita": [22,14,1,10,[4,29],[5,7,19,34],[20,23,30,33],31,[13,16,25,27,28],[6,9,38],[2,11,12,15,26,37],[3,8,24,35,36,39,40],[17,18,21,32]],
"نَبِيِّنَا": [3],
"أَنَسٌ": [14],
"أَنَسٍ": [35,[3,14,17,23,25,27,31,39,40]],
"أَنَسَ": [30,[22,27,31,33,37]],
"wadz": [12,19],
"أَنَسُ": [13],
"menghadap": [[10,23]],
"فَلَقِيَهُمَا": [11],
"posisi": [1],
"أَوْلِمْ": [25],
"سَمِعْتُ": [7,14,33,[19,34,38],[1,22,26,28,29,30],[4,5,8,10,18,20,23,25,27,31,36,37]],
"sebiji": [25],
"مَالَ": [4],
"kepentingan": [15],
"meihat": [19],
"keberadaannya": [1],
"يَخْدُمُنِي": [2],
"الْجُوعِ": [2],
"يَكْمُلْ": [22],
"أُنَاسًا": [34],
"pembagian": [4],
"membenarkan": [8],
"نَحْرِكَ": [40],
"berselisih": [1],
"أَتْبَاعَهُمْ": [28],
"sepulang": [27],
"surah": [38],
"السَّمْتِ": [19],
"kubagi": [25],
"أَحْسِبُهُ": [[5,14]],
"دَسْمَاءُ": [33],
"azza": [23],
"diletakkannya": [33],
"isra\'il": [12],
"ibuku": [[5,24,40]],
"أُحِبُّهُ": [[14,18,38]],
"وَإِمَّا": [40],
"yarmuk": [5],
"pertemuan": [23],
"temui": [1],
"lagi": [12,5,[4,19,25],[1,22,23,33]],
"دَعَا": [[4,30]],
"nu\'min": [14],
"ridla": [[1,23]],
"عَمَّارٌ": [22],
"النَّاسُ": [1,[22,23,33,40]],
"النَّاسَ": [22,[2,33]],
"لِأَبِي": [[15,40]],
"وَابْنَ": [17],
"النَّاسِ": [9,27,[2,14]],
"suguhkanlah": [32],
"wahai": [22,1,5,[2,4,10,13,28,29,30,33,34,40]],
"وَقَعَ": [40],
"اشْتَرَيْتَنِي": [15],
"tiba": [25,[19,22,23]],
"بِهِمْ": [32],
"النَّارِ": [11],
"مَكِّيُّ": [7],
"هَلْ": [[5,20]],
"mahdiy": [23],
"diputuskan": [34],
"uqbah": [[7,14]],
"سَلَكُوا": [24],
"الْمِنْبَرَ": [33],
"يَتَحَرَّوْنَ": [22],
"berada": [5,1,4,[10,22,27]],
"lait": [[10,22]],
"كَيْفَ": [12,[1,19]],
"لِلْمُسْلِمِينَ": [22],
"خَيْبَرَ": [[1,4]],
"الْمِنْبَرِ": [[1,14,33]],
"الشَّاةُ": [7],
"selesai": [25],
"berita": [23,17],
"عِدَّتُهَا": [25],
"begitu": [5,1],
"karena": [[1,10,15,20,22,32],[2,5,7,9,11,19,23,24,30,38,40]],
"biasa": [[1,2,22]],
"dituli": [[10,39]],
"فَأَقْسِمُ": [25],
"أَجَارَهُ": [12],
"lain": [22,29,[12,19,37],[4,5,11,32]],
"فِيهِنَّ": [6],
"zuhri": [10],
"رَأَيْتَنِي": [5],
"صَاحِبُ": [12,19],
"berisi": [2],
"jalur": [7],
"wahb": [11],
"أَخُو": [33],
"ingin": [[1,22]],
"فَأَحِبَّهُ": [14],
"memberi": [1,[2,22,23],[5,17,24,25,33,40]],
"شُعْبَةُ": [[1,14,22,28],[19,26,29,30,31,33,34],[4,12,13,18,20,23,24,27,36,37,38,39]],
"hampir": [[12,19]],
"أَمِيرِ": [20],
"hukuman": [10],
"أَقُولُ": [11],
"lalu": [1,10,32,[8,11,12,25],[4,5,19,22],[2,9,14,17,33],[13,18,20,23,27,31,34]],
"bagian": [28,[4,25],[8,21,29,30]],
"menyusahkannya": [8],
"disusunnya": [0],
"فَوَفَى": [8],
"فَبَاتَا": [32],
"مما": [4],
"madlarat": [33],
"laki": [[5,10]],
"surga": [30,[22,34]],
"memakan": [2],
"tertinggal": [1],
"menikmati": [32,1],
"pekarangan": [4],
"malaikat": [11,22],
"وَسَعْدِ": [25],
"penamaan": [23],
"وَبَيْنَ": [25],
"وَسَعْدٍ": [6],
"نُعْمٍ": [14],
"خَادِمٍ": [1],
"تُرِيدُهُ": [22],
"pakaian": [[2,25,34]],
"musa": [[10,14,19],[1,7,16,22,23]],
"يَأْمُرَ": [22],
"سَاعِدَةَ": [29,37],
"setinggi": [40],
"عَلْقَمَةُ": [12],
"diturunkannya": [0],
"عَلْقَمَةَ": [[12,19]],
"بِرَأْسِ": [14],
"إِيَّاهُ": [8],
"mulaikha": [14],
"وَأَقِطٍ": [25],
"أَتْبَعُهُ": [4],
"نِصْفَيْنِ": [25],
"قَالَتْ": [22,[4,23,28],[1,9,25]],
"lihat": [[1,10,29]],
"melihat": [14,11,[22,40],[6,10,19,20,27]],
"sanksi": [10],
"makan": [32,[2,4]],
"كَلِمَةً": [24],
"لَيَأْخُذَنَّ": [1],
"لِعَلِيٍّ": [1],
"وَجَعٌ": [1],
"mencintai": [26,[1,10,14]],
"namir": [10],
"amalnya": [1],
"lama": [[1,19]],
"يُيَسِّرَ": [12],
"أَحَدُ": [39],
"أَحَدٌ": [[7,10,12,14]],
"hidayah": [1],
"أَحَدٍ": [10],
"maksudnya": [12,[17,22]],
"berbohong": [23],
"حَوَارِيَّ": [5],
"sembunyi-sembunyi": [0],
"bertemu": [[1,30]],
"يَدْعُو": [1],
"berani": [10],
"ar-rafidlah": [1],
"فَجَلَسْتُ": [12],
"sesunguhnya": [10],
"وَيَقُولُ": [14,22],
"terkhusus": [0],
"بِأَنْفِكَ": [1],
"disana": [12,19],
"يَسْحَبُ": [10],
"إِلَّا": [31,[7,22,25,26,32],[1,10,11,19,20,29,30]],
"بَعْضُهَا": [9],
"دَاوُدَ": [32],
"وَزَيْدُ": [[9,39]],
"tiga": [1,[5,40],27],
"ajal": [4],
"kemarahanku": [[4,21]],
"الْكُوفَةِ": [12,[19,22]],
"لَقَدْ": [7,[12,20]],
"umamah": [34],
"مَضَاجِعَكُمَا": [1],
"menceritakan": [10,1],
"آكُلُ": [2],
"bagiku": [5],
"alaihimas": [1],
"menikahkan": [8],
"siwak": [12],
"فَانْطَلَقْتُ": [5],
"meletakkannya": [14],
"مِنْهُمْ": [28],
"abdan": [[14,33]],
"وَتَقِلُّ": [33],
"yag": [[19,25]],
"وَرَسُولَهُ": [1],
"asy-sya\'biy": [2],
"قَلِيلًا": [11],
"مُحَمَّدٍ": [14,[3,4,5,10,22,25,30]],
"وَعَلِيٌّ": [14],
"مُحَمَّدُ": [[1,14,22,34],[30,33],[2,3,6,7,8,10,19,20,24,28,29,31,36,38,39]],
"مُحَمَّدِ": [15,[5,14,24]],
"sandal": [[12,19]],
"arsi": [34],
"يُونُسَ": [[11,22]],
"zanad": [25],
"إِلَيْهِمْ": [12],
"سَمِعْنَا": [25],
"shilah": [13],
"شُعْبَةَ": [[14,38]],
"فَتَرَكَ": [8],
"عَلِيًّا": [[1,8]],
"untukku": [[12,25]],
"melihatku": [5],
"غَدَا": [32],
"tambahan": [4],
"وَمَنْ": [5,[26,32]],
"dariempat": [38],
"مَا": [[1,22],[2,7,19,32],[4,5,12,18,20,23,24,25,29,31,33]],
"pakaiannya": [[10,40]],
"أَنَّكَ": [8],
"mementingkan": [30],
"طَعَامٌ": [7],
"وَمَشَاهِدِهِمْ": [23],
"hal": [28,[1,22],[8,19,25,33]],
"hak": [33],
"صِهْرًا": [8],
"كَادُوا": [[12,19]],
"لَسَلَكْتُ": [[23,24]],
"uhibbuhuma": [14],
"خُيِّرَ": [29],
"مَخْضُوبًا": [14],
"jumlahnya": [[25,33]],
"لَعَلَّ": [1],
"berpendapat": [1],
"melihatmu": [5],
"qasim": [[22,24]],
"ubaidullah": [31],
"وَآخَى": [25],
"dapat": [0,[5,11,12,19,22]],
"تُرَابٍ": [1],
"فَأَخْبَرَتْهَا": [1],
"يُحِبُّ": [1],
"mengherankan": [23],
"قُبِضَ": [4],
"سُلَيْمٍ": [40],
"مَعِينٍ": [14],
"نَرَى": [19],
"radhiallahu": [20],
"لِأُسَامَةَ": [10],
"memberikanya": [22],
"خَبَرُهُمْ": [17],
"anhuma": [[1,14],[10,11,22],[2,4,9,15,16,33,36]],
"perbedaan": [1],
"شُحَّ": [32],
"لَنَا": [7],
"disamp": [14],
"مَالِكُ": [[5,12]],
"مَالِكٍ": [30,[31,33],[13,14,22,26,27,29,37,38]],
"pengasih": [34],
"engkau": [[3,10]],
"سَقَطَ": [1],
"kota": [[1,22,23]],
"هَيِّئِي": [32],
"حُلَّةُ": [34],
"berdoa\'a": [16],
"وَقَدِ": [23],
"وَعَيْبَتِي": [33],
"وَقَدْ": [33,[1,14]],
"بِالزُّبَيْرِ": [5],
"sebab": [40],
"إِسْمَاعِيلُ": [25,[2,15]],
"إِسْمَاعِيلَ": [[5,22,23],[7,10,12]],
"سَارَّنِي": [4],
"istri-istri": [22],
"shaalihan": [12],
"shamad": [[29,37]],
"jalan": [[7,16,19,22]],
"anaknya": [[27,32]],
"يُهْدُوا": [22],
"مناقب": [23],
"taruhannya": [40],
"pun": [[11,17],[4,5,10,26,34,38]],
"mentaati": [22],
"أَنَّهُ": [10,[4,5,14,22,25,27,29]],
"الْخَمِيرَ": [2],
"جَابِرُ": [15],
"لِأَنَسٍ": [[23,39]],
"جَابِرٍ": [34,5],
"فَقَدِمَ": [23],
"الْكِتَابَ.حَدَّثَنَا": [16],
"iraq": [14],
"عَلَيْنَا": [[25,29,37]],
"وَحَمَلَ": [14],
"فَمَنْ": [[4,21,26,33]],
"memasuki": [12],
"سَبْيٌ": [1],
"صِبْيَانَكِ": [32],
"وَأَخِي": [19],
"اجْلِسْ": [1],
"فَقَدْ": [9],
"يَقُولُونَ": [2],
"mushir": [5],
"pelanggaran": [10],
"يُكَلِّمَهُ": [10],
"terakhir": [29],
"أَحْسَنَكُمْ": [19],
"kepada-mu": [3],
"juga": [[2,5,19],[12,22,30,34]],
"pengasuh": [10],
"mulut": [[12,19]],
"taat": [25],
"carilah": [5],
"بَعْثًا": [9],
"فَدَعْنِي": [15],
"الْمَنَامِ": [11],
"kepadaku": [14,[10,22],[5,8],[4,19,23,29],[1,7,9,20,25,30,34],[2,3,6,11,13,24,26,27,31,33,36,38,39]],
"mintalah": [22],
"رَافِعٍ": [1],
"الْمَقْبُرِيِّ": [2],
"بُيُوتِكُمْ": [23],
"مَكَثْتُ": [7],
"makanan": [22,[2,32],[7,33]],
"وحَدَّثَنِي": [10],
"أَقْرَأَنِيهَا": [[12,19]],
"kalung": [22],
"perang": [1,[5,6,31],[4,7,17,23,34,40]],
"memiliki": [28,[5,7,11,13,25,32]],
"السَّلَامَ": [22],
"أَيْنَ": [[1,22],[19,25]],
"مَكَانِكُمَا": [1],
"tadi": [[9,32,33]],
"إِسْرَائِيلُ": [12],
"إِسْرَائِيلَ": [10],
"persoalan": [10],
"sifat": [[1,2,4,5,7,9,11,12,13,14,15,17,18,19,21,23,34,35,36,37,38,39,40]],
"السَّلَامُ": [[2,22]],
"akulah": [2],
"حُضَيْرٍ": [35,[22,30]],
"فَأَنْزَلَ": [32],
"الخزرج": [29],
"barangkali": [5],
"نُعَيْمٍ": [15],
"sebagian": [10,[6,9]],
"نُعَيْمٌ": [10],
"شَابًّا": [11],
"pihak": [10],
"أَوَلَيْسَ": [12],
"huruf": [[12,19]],
"periwayatannya": [7],
"demikian": [7],
"sepanjang": [5],
"didalamya": [6],
"اهْتَزَّ": [34],
"بِشْرٍ": [[20,35]],
"kekeringan": [3],
"penjaga": [33],
"menginginkan": [1],
"aaalloohumma": [16],
"pergilah": [1],
"مَاتَ": [1],
"mirip": [14,19],
"mimisan": [5],
"ستصيبكم": [30],
"do\'aku": [19],
"berapa": [25],
"kendi-kendi": [40],
"kawan": [[12,19]],
"أَرْبَعَةٌ": [39],
"أَرْبَعَةٍ": [[18,19,36,38]],
"sepeninggalku": [30],
"mudik": [2],
"fathimah": [4,1,8,[10,21]],
"asal": [9],
"الْحَجِّ": [5],
"syihab": [[8,22]],
"menurutmu": [23],
"أَمِينًا": [13],
"جَنْبِي": [12],
"يُرْوَى": [1],
"asad": [[7,27]],
"jalin": [4],
"لَهُ": [1,22,[7,8,10,25,37,40]],
"sejak": [[18,25]],
"tentara": [34],
"menyampaikan": [22,10,[0,7]],
"tahu": [18],
"abba": [20,[3,16,33],[1,22,29]],
"أَتَوْا": [22],
"يَقْتُلُ": [14],
"مُقْبِلًا": [19],
"bertayamum": [22],
"الْحَجَّاجَ": [10],
"لَأَعْلَمُ": [22],
"الْحَجَّاجُ": [10],
"penuli": [0],
"الْحَجَّاجِ": [33],
"الْجَنَاحَيْنِ": [2],
"مُسَدَّدٌ": [[6,14,16,32]],
"شُعَيْبٌ": [[4,8]],
"أَبِيهِ": [[5,22],1,[4,6,7,9,14,23,25,31]],
"aban": [20],
"تَخَلَّفَ": [1],
"لَنْ": [11],
"marah": [[4,8,21]],
"وَأُمِّي": [[5,24,40]],
"tujuan": [0],
"عَنْ": [1,14,22,10,4,[11,19],[5,34],[12,25],[29,31,33],[2,6,7,8,9,13,16,20,23,30,35,36,38],[15,17,18,21,32],[3,24,26,28,39],[27,40]],
"أَوِ": [[7,12]],
"أَوَ": [19,[5,29]],
"بَيْنَهُمَا": [5],
"ذَكَرْنَا": [33],
"لِحَافِ": [22],
"أَوْ": [[1,12,23,24],[22,25,32,34],[5,14,18,26,29,33,40]],
"sebagaimana": [1,[4,14,22,30]],
"menangi": [[4,33],38],
"خَيْرُ": [29,37],
"melainkan": [31,[22,25]],
"خَيْرَ": [29],
"خَيْرٌ": [[1,29],[34,37]],
"memelukku": [16],
"فَبَكَتْ": [4],
"pengikut": [28,5],
"hafsh": [[5,19,29]],
"لَمْ": [19,[1,6,10,14,38]],
"serta": [[0,4]],
"أَسَدٍ": [[7,27]],
"سَيِّدِكُمْ": [34],
"أَتْبَاعَنَا": [28],
"عَنِ": [14,[29,34],[1,5,10,24,26,31,33,40]],
"ja\'di": [1],
"qai": [[6,15]],
"sulaim": [40],
"menunaikan": [[5,33]],
"abdu": [16,8],
"benar": [12,5,[20,23]],
"abiyyinaa": [3],
"menderita": [[4,22]],
"rawahah": [17],
"دَعَوْتُ": [12],
"tentang": [10,[1,4,14,23],[7,17,19,20,22]],
"فَصَلَّيْتُ": [[12,19]],
"أَنّ": [[17,21,22]],
"أَنْ": [1,[4,22,28,30],[8,9,10,11,12,14,17,19,23,29,34,38]],
"لَكَ": [[1,25],20],
"مُحْسِنِهِمْ": [33],
"أَخَذْنَا": [1],
"لَكِ": [22],
"datangilan": [1],
"اقْضُوا": [1],
"يُوسُفَ": [[14,19]],
"ummul": [22],
"mendo\'akan": [28],
"ahlil": [38],
"sebelum": [[9,10,17]],
"rahmatullahi": [22],
"أَمْ": [23],
"menggerak-gerakkan": [32],
"أَبَتِ": [5],
"laksanakanlah": [[1,30]],
"أَرَادُوا": [32],
"جَدِّهِ": [25],
"حَدِيثِ": [10],
"berbunyi": [19],
"أَوْتَرَ": [20],
"وَتَجَاوَزُوا": [33],
"شَيْءٌ": [2],
"kaummu": [[8,23]],
"شَيْءٍ": [12],
"telaga": [30],
"hakiki": [31],
"merasakannya": [2],
"negeri": [12,[19,30]],
"تُرَاعَ": [11],
"mas\'ud": [19,[12,18,38],36],
"menunggang": [34],
"نَحْفِرُ": [31],
"وَمَوْعِدُكُمُ": [30],
"عَامِرِ": [7],
"tujuh": [7],
"الإصابة": [16],
"نَظَرَ": [10],
"أَكْرَهُ": [[1,8]],
"حدث": [10],
"tamu": [32],
"hudair": [35],
"kecuali": [[1,12,19,26],[6,7,10,11,20,22,25,30,32]],
"tangan": [[6,34,35]],
"beka": [1],
"berkumpul": [[1,8,22]],
"umat": [0],
"umar": [[1,10],11,14,[2,3,4,5,7,9,15,18,19,20]],
"أَعْرِفُ": [19],
"dilukai": [23],
"فَأَدْرَكَ": [29],
"lapar": [[2,32]],
"menyerahkan": [1],
"فَاهُ": [19],
"beruntung": [[11,32]],
"hadapan": [[1,17,18,38]],
"menunjukkan": [[22,25]],
"هُوَ": [5,[1,10,23]],
"tatkala": [[1,5]],
"مِسْوَرٍ": [8],
"salamah": [22,5,[1,15,29]],
"kekikiran": [32],
"memudahkan": [0],
"اللَّهُمَّ": [[12,14,31],[3,10,16,19,27,28]],
"اسْتَعَارَتْ": [22],
"menyampaikannya": [10],
"عِنْدَنَا": [32],
"pendahulunya": [1],
"ضَغَائِنُ": [34],
"waqqash": [7],
"أَنْتُمْ": [27],
"تَزَوَّجْتُ": [25],
"mentaa\'ti": [22],
"menjawab": [[1,25],5,[12,23],[10,19,20,30,33,39]],
"affan": [5],
"membangkitkan": [[4,21]],
"كُنَّا": [[3,23]],
"rahasiaku": [33],
"أَنَسًا": [[23,29,34]],
"أُحُدٍ": [[7,40]],
"wasmah": [14],
"terpercaya": [13],
"pamanmu": [1],
"سَيِّدُنَا": [15],
"النبوة": [16],
"كَمَا": [1,[7,14,22,30]],
"pandai": [9],
"هُمْ": [32],
"الْوَارِثِ": [16,[27,40]],
"asma": [22],
"baginya": [22],
"لِمَوْتِ": [34],
"mulut-mulut": [40],
"سِيرِينَ": [1],
"أَيْمَنَ": [10],
"أَيْمَنُ": [10],
"musibah": [5,3],
"mengurus": [[25,33]],
"sering": [2],
"الشَّجَرِ": [7],
"hasyim": [7],
"yakni": [12,[4,13,19]],
"هَذِهِ": [[9,34]],
"بَارَكَ": [25],
"kakinya": [40],
"كتاب": [0],
"bere": [7],
"أَحْكُمُ": [34],
"الْمُطَّلِبِ": [3],
"husein": [14],
"قَتَادَةَ": [[29,30,31,33,38,39]],
"letak": [25],
"الْمُبَارَكِ": [[5,10]],
"قَتَادَةُ": [[29,34,35,37]],
"hafshah": [11],
"paman-pamanku": [39],
"bertambah": [33],
"لَأَحَبَّهُمْ": [5],
"عَادَ": [22],
"selendang": [1],
"maslamah": [1],
"عُقْبَةَ": [14],
"hanya": [[1,2,25,32]],
"قِدَمٍ": [37],
"abbad": [[10,35]],
"dahulukan": [18],
"فَذَهَبْتُ": [1],
"الْمُثَنَّى": [[3,7,34]],
"قُلْتُ": [12,[5,10,19],[23,39]],
"مُعَاوِيَةَ": [20],
"مُعَاوِيَةُ": [[20,31]],
"لِمَا": [19],
"تَلْقَى": [1],
"فَضْلٌ": [25],
"فَضْلُ": [[22,34]],
"pemilik": [12,19],
"kekerabatan": [8],
"al-bayyinah": [38],
"tahun": [5],
"مَعْمَرٌ": [[10,14,35]],
"لَوْ": [10,[11,23,24]],
"مَعْمَرٍ": [[11,14,16,27,40]],
"بَدَأَ": [18],
"bebekitan": [23],
"sendainya": [10],
"bahkan": [23],
"النِّسَاءِ": [22,5],
"قَدَمَيْهِ": [1],
"النِّسَاءَ": [27],
"فَأَرْغَمَ": [1],
"اللَّهُ": [1,32,23,[4,12,22,25,26],[14,17]],
"akan": [1,4,[25,30,34],[10,22,23,26,28],[5,8,13,14,24,33]],
"مَخْزُومٍ": [10],
"اللَّهِ": [22,1,4,10,[14,25],[5,8,12,18,19,31,32],[3,9,11,38],[2,7,23,27,29,30,37],[6,13,15,17,20,21,26,28,33,34,36,40]],
"اللَّهَ": [[28,33],[1,12,14,22,38]],
"seperlima": [4],
"بِحَسْبِكُمْ": [29],
"sejahtera": [[2,22]],
"yasir": [12],
"سَتَلْقَوْنَ": [30],
"pewarna": [14],
"ampunilah": [31],
"صَلَّى": [32,[1,4,14]],
"cover": [0],
"بِمُعَاذِ": [18],
"أُمِّهِ": [19],
"فَضَّلَ": [[29,37]],
"punggungnya": [1],
"أَعِدْ": [10],
"لَهَا": [11,27],
"katsir": [27],
"أَتْبَاعٌ": [28],
"تَرْضَى": [1],
"قَحَطُوا": [3],
"mungkin": [1,10],
"كَعْبٍ": [[18,19,38]],
"tengah": [[1,4,35]],
"الْجَعْدِ": [1],
"وَلَكِنَّ": [22],
"أصاب": [20],
"baskom": [14],
"اسْتَعْمَلْتَ": [30],
"zaman": [[4,11,39]],
"فَهَيَّأَتْ": [32],
"أُسَامَةَ": [10,22,[5,7,9,14,23]],
"أُسَامَةُ": [10],
"sebutan": [1],
"inilah": [1],
"anggapanku": [29],
"agama": [20],
"padahal": [14],
"menyelesaikan": [0],
"ahmad": [[2,5,17,33]],
"rugi": [7],
"menyebutnya": [38],
"menegakkan": [10],
"وَالْهَدْيِ": [19],
"menjadikan": [28,[12,22,29]],
"فِئَتَيْنِ": [14],
"وَأَثْنَى": [33],
"biarkanlah": [[15,20]],
"جَرِيرٍ": [23],
"جَرِيرٌ": [14],
"faahibba": [14],
"بِذَلِكَ": [[8,9,33]],
"digunakan": [6],
"memberikan": [22,1,[0,23,30]],
"لَتُصَلُّونَ": [20],
"نُرِيدُ": [22],
"ummu": [[10,22],19,[12,40]],
"jabir": [34,[5,15]],
"عَرْعَرَةَ": [34],
"ibu": [1],
"السِّرِّ": [[12,19]],
"أَهَمَّهُمْ": [10],
"أَفَلَمْ": [19],
"وَتشْرِكُونَا": [25],
"mulaikah": [20,[4,21]],
"kepercayaan": [13,1],
"saudara-saudara": [30],
"قَيْنُقَاعَ": [25],
"فَلْيَقْبَلْ": [33],
"khaththab": [[1,3,15]],
"فَأُطَلِّقُهَا": [25],
"شَيْخًا": [19],
"isinya": [2],
"تَسْأَلُهُ": [4],
"wa-innaa": [3],
"مُعْتَمِرٌ": [[6,10]],
"سُيُوفِ": [17],
"نَافِعُ": [20],
"ubadah": [[29,37]],
"tertawa": [4,[1,14,32]],
"pemberian": [1],
"صَدْرِي": [1],
"bershahabat": [20],
"ajaibnya": [35],
"lebih": [1,34,[4,14,19,32,37,38]],
"تَكُونَ": [1],
"إذا": [19],
"الْغُدُوَّ": [25],
"أَرَأَيْتَ": [23],
"عَنْهُمَا": [20],
"فَتَزَوَّجْهَا": [25],
"berkuah": [22],
"الصَّمَدِ": [[29,37]],
"ruku": [10],
"menantu": [34],
"memperoleh": [[1,19]],
"كُنْتُ": [[2,5]],
"كُنْتَ": [15],
"kamihammad": [22],
"بِأُبَيٍّ": [18],
"مُرَّةَ": [22,[18,28,38]],
"يَعْنِي": [12,[4,13,15,20]],
"asyh": [29,37],
"memal": [19],
"melanjutkan": [[1,34]],
"أُخْتِهِ": [11],
"turun": [22],
"tersampaikan": [0],
"مَسْعُودٍ": [[19,38],[18,36]],
"dikatakan": [5],
"يَسِّرْ": [12,19],
"muhammad": [14,22,[1,3,30,34],[4,5,10,15,24,31,33],[0,2,6,7,8,19,20,25,28,29,36,38,39]],
"ثُمَّ": [29,1,[4,37],[17,25,33,40],[7,10,12,32]],
"adalah": [5,29,[10,22],[7,14,19,23,25,27],[1,2,4,9,11,12,26,33,37],[8,13,15,16,18,21,28,30,31,34,39,40]],
"شِهَابٍ": [[8,22]],
"أَفْضَلَ": [25],
"ajaklah": [1],
"فَلَحِقَنَا": [29],
"dibahu": [14],
"qais": [7],
"telah": [14,[1,22],10,29,5,7,4,[19,20,23,34],[28,33],[25,30],12,[27,31],[6,13,15,16,26],[2,9,37,38,40],[8,11,24,35],[3,36,39],[0,17,18,21,32]],
"إِلَيْكَ": [[3,25]],
"الضَّرَبَاتِ": [5],
"أَرْقَمَ": [28],
"abdullahbin": [38],
"يَزْعُمُ": [8],
"bejana": [[12,19]],
"فَاقْبَلُوا": [33],
"اسْتَخْلِفْ": [5],
"أَتَاهُ": [5],
"أَخْبَرَنِي": [14,5,[4,10,26,27,29]],
"النَّعَمِ": [1],
"asy\'ariy": [[19,22]],
"syaiban": [29],
"الْمُحْرِمِ": [14],
"al-hasyr": [32],
"يَأْكُلُ": [4],
"وَفَضْلُ": [22],
"meningg": [4],
"قَصَّهَا": [11],
"أَخْبَرَنَا": [14,[5,10,35],[1,2,4,7,8,15,22,33]],
"membawaku": [11],
"أَخْيَرَ": [2],
"عَبْدٍ": [19,12],
"عَبْدُ": [[1,11,22],[10,12,14,16,25,27,40],[3,4,5,7,9,13,15,18,19,29,30,32,37,38]],
"abuturab": [1],
"عَبْدَ": [[11,14,19]],
"jumpai": [30],
"mengerjakannya": [20],
"يَهْدِيَ": [1],
"زَالَ": [[12,19]],
"شَيْخٌ": [12],
"فَمَكُثْنَا": [19],
"seperti": [1,[16,29,30,31,32,34]],
"dibala": [37],
"عَلَيْهَا": [4],
"مُقَاتِلَتُهُمْ": [34],
"didapat": [16],
"akhirnya": [[1,5,17,22]],
"لَثُلُثُ": [7],
"hadapannya": [40],
"وَدَلًّا": [19],
"oleh": [17,[10,34],[1,2,4,7,8,22,39]],
"عَبْدِ": [22,[3,10,25,29],[18,19,38],[2,4,5,7,8,9,15,26,36,37]],
"berselendang": [33],
"sufyan": [10,[30,34]],
"يَجْتَرِئْ": [10],
"وَدَعَا": [1],
"atas": [[5,17]],
"atau": [[12,23],[1,24],[25,32,40],[5,7,11,14,18,22,26,29,33,34]],
"مَرَّتَيْنِ": [[1,5,27,40]],
"keluar": [[1,33],35],
"يَجْتَرِئُ": [10],
"adakanlah": [25],
"zaidah": [1],
"سُوقِهِمَا": [40],
"disodorkan": [14],
"فِيهَا": [4,2,[10,11]],
"لِبَنَاتِكَ": [8],
"وَرَسُولُهُ": [1],
"لِرَسُولِهِ": [23],
"seekor": [25],
"حُذَيْفَةَ": [19,[12,13,18,36,38]],
"تُرَدُّ": [23],
"طَلَبِهَا": [22],
"انْظُرْ": [10],
"دُخُولِهِ": [19],
"نَاسًا": [22],
"tahmid": [1],
"سَبِيلِ": [7],
"حِمَارٍ": [34],
"pohon": [7],
"أَحْمَدُ": [[2,5,17,33]],
"وَوَعَدَنِي": [8],
"ayat-ayat": [[12,19]],
"budak": [9],
"وَصَدَقَنِي": [8],
"dinar": [10,[2,4,9,21]],
"وَأَعْتَقَ": [15],
"maryam": [[20,22]],
"mejawab": [38],
"وَزَادَ": [8],
"maafkanlah": [33],
"mimbar": [33,[1,14]],
"sa\'d": [7],
"صِلَةَ": [13],
"datangi": [32],
"ini": [[1,10],[23,32,34],[4,9,14,16,22],[0,5,6,7,11,12,19,20,25,29,31,40]],
"punggung": [1],
"الْمَأْكَلِ": [4],
"سُفْيَانُ": [[10,30]],
"سُفْيَانَ": [34],
"perempuannya": [11],
"baginda": [30,[8,28,40],22],
"berwasilah": [3],
"أَصَابَ": [5],
"بِضْعَةٌ": [21],
"selimut": [[22,33]],
"nabi-nya": [12,19],
"quraisi": [23,[5,10]],
"فَبَكَى": [38],
"kesepakatan": [1],
"وَبِنْتُ": [8],
"ahlul": [14],
"طَعَامَكِ": [32],
"خُذُوا": [38],
"ayyub": [[1,10,17]],
"بِحُكْمِ": [34],
"بَعْدَ": [20,[18,33]],
"بَعْدُ": [[8,33]],
"membersihkan": [1],
"tumbuhan": [14],
"قَالُوا": [5,[7,12,25,33]],
"barangsiapa": [[4,21,26,33]],
"alqur\'an": [38],
"الدَّرْدَاءِ": [12],
"شَبِيهٌ": [14],
"memang": [2],
"mencintainya": [10,[1,14,18,26,38]],
"مُعَاذ": [34],
"takut": [11],
"الرحى": [1],
"terdiam": [5],
"وَلَوْلَا": [24],
"أَصْبَحَ": [[1,32]],
"hudlair": [35,[22,30]],
"anhum": [[4,30]],
"وَمَعَهَا": [27],
"فَنَظَرْتُ": [5],
"maqburiy": [2],
"jawab": [12,[5,10,19]],
"memeluk": [14],
"نَفْسِي": [[4,5,27]],
"مُجَوِّبٌ": [40],
"qatadah": [29,[30,31,33,34,35,37,38,39]],
"semakin": [33],
"perutkuyang": [2],
"makhlad": [[5,9,29]],
"الْحَكَمِ": [[1,5,22]],
"abd": [19,12],
"harit": [29,[5,37]],
"tebusanku": [7],
"terang-terangan": [0],
"bersamanya": [30],
"حَجَّاجُ": [[14,26]],
"رَجُلًا": [1,[28,30,32,40]],
"menyaksikannya": [9],
"النَّجَّارِ": [29,37],
"abu": [[1,4,12],14,[2,40],[19,34],[22,29],[7,10,13],[6,8,15,20,28],[5,23,24,25,33],[18,21,31,32,38,39],[16,27,36,37]],
"التَّمْرِ": [25],
"عَفَّانَ": [5],
"berdiri": [[8,10,27,32]],
"nampak": [7],
"بِمَجِيءِ": [1],
"غُلَامًا": [11],
"أَنَا": [[5,22],[1,19,32]],
"زِيَادٍ": [[14,24]],
"الْعَزِيزِ": [1,[5,15,22,27,40]],
"terjatuh": [1],
"الْغَسِيلِ": [33],
"mempekerjakanku": [30],
"ibnu": [10,1,20,14,[4,11,22],[2,16,21,28,33],[5,6,7,8,12,15,17,19,31,36]],
"عَلَيْكُمْ": [13],
"ثُلُثُ": [7],
"tiba-tiba": [[10,12]],
"perintahkan": [22],
"ada": [12,19,10,[1,11,14,22,31,40],[4,7,26,34],[2,5,6,8,9,18,20,24,30,32,35]],
"قَرَأَ": [19],
"diband": [29],
"وَمَا": [1,[4,7,10]],
"tebusanmu": [5],
"فَذَكَرَتْ": [22],
"kepentingannya": [1],
"اسْتَجَابَ": [19],
"حَازِمٍ": [1,[6,31,32]],
"warit": [16,[27,40]],
"dibalut": [33],
"itu": [1,5,32,14,[22,28],[17,19],[9,11,30,40],[4,7,8,12,20,23,24,25,33,39]],
"شَيْئًا": [[4,14,25]],
"muslimin": [[1,14,22]],
"عَيْشَ": [31],
"adz": [[34,36]],
"maula": [[10,20],[18,19,36,38]],
"عَيْشُ": [31],
"dzakari": [19],
"أَكْثَرِهَا": [25],
"جَعَلَ": [22],
"pertama": [[4,7]],
"ternyata": [[5,10,12]],
"pasti": [24,[4,10,13,23,25]],
"فَسَكَتَ": [5],
"sepatutnya": [30],
"شِعْبَهُمْ": [23],
"dimana": [22,[1,6,25]],
"ishaq": [19,[11,13,34,37]],
"ajarkan": [1],
"مُحَمَّدًا": [[4,14]],
"أَخْلَاقًا": [19],
"simpatinyanya": [2],
"sedangkan": [[23,33],[9,14,40]],
"فَلَحِقَ": [1],
"bacalah": [1],
"tebusannya": [[24,40]],
"بَعْضُ": [[9,10]],
"berbicara": [22,[4,19,24]],
"بَعْضِ": [6],
"عَبْدَانُ": [14],
"ikat": [33],
"tasbih": [1],
"عَبْدَانَ": [33],
"menceritakannya": [11],
"membisikkan": [4],
"haritsah": [9],
"بَعْضٍ": [9],
"ابْنَةِ": [14],
"الصَّلْتُ": [25],
"lewat": [1,[33,40]],
"cerita": [6],
"قَائِفٌ": [9],
"mudahkanlah": [12,19],
"اسْتَسْقَى": [3],
"adzdzakaro": [[12,19]],
"turunkanlah": [3],
"adzdzakari": [19],
"mengagumi": [9],
"فَأَحِبَّهُمَا": [14],
"nabi": [1,19,[4,14,29,34],[9,33],[22,28,40],[5,10,12,26,27,30],[3,6,7,11,24,25,31,35,38],[0,2,8,13,16,17,20,23,32,36,39]],
"qutaibah": [1,[10,25]],
"عُيَيْنَةَ": [[4,14,21]],
"allohumma": [14],
"تَرَكُوهُ": [10],
"مَرَّةً": [14],
"رَآهُ": [10],
"menguji": [22],
"هِيَ": [[2,11]],
"an-najjar": [[29,37]],
"segera": [4],
"syam": [12,[8,19]],
"menuju": [5],
"خَيْرِكُمْ": [34],
"memutuskan": [[1,34]],
"أَهْلِكَ": [25],
"iya": [31],
"قُومُوا": [34],
"شَكَتْ": [1],
"sallam": [[4,8,9,24,25,27,30,31,33]],
"abidah": [1],
"menolak": [22],
"يَزِيدُوا": [4],
"wajib": [33],
"وَادِي": [24],
"nifaq": [26],
"sabdanya": [5],
"air": [7,[17,32,40]],
"صالحا": [19],
"السَّيْفُ": [40],
"الْمُسْلِمِينَ": [14],
"فَصَدَقَنِي": [8],
"tidaklah": [[1,20,24]],
"apakah": [5,10,23,[1,20,22,29,34,38]],
"jadikanlah": [28],
"mendatangkan": [33],
"مُحَمَّدَا": [31],
"teringat": [33],
"berpesan": [11],
"بِنَا": [2],
"حَارِثَةَ": [9],
"سَلَكَتْ": [23],
"isya": [20],
"أُمَامَةَ": [34],
"لِأَهْلِ": [13],
"nafi": [20],
"maupun": [[0,2]],
"الْيَمَنِ": [19],
"aku": [12,5,19,1,7,[11,22],25,[4,14],[2,8],28,[10,15,27,30,33,38],[23,34],[9,24,26,29,37,40],[6,13,18,20,31,32,36,39]],
"وَادِيَ": [23],
"الْمَسْجِدَ": [12],
"الْمَسْجِدِ": [[1,10],[11,34]],
"mubarak": [[5,10]],
"keturunan": [9],
"sisa-sisa": [2],
"تَحْتَمِلْهُ": [10],
"memberlakukan": [4],
"ali": [1,8,14,[4,5,22],[2,10,13,33,35]],
"مَسْرُوقًا": [19],
"وَأَصْبَحَتْ": [32],
"شَدِيدَ": [40],
"wajalla-lah": [23],
"شَدِيدٌ": [5],
"secara": [0],
"alaa": [19],
"صِدْقٍ": [22],
"lubang": [11,5],
"nabiyyinaa": [3],
"makkiy": [7],
"kehidupan": [31,12,19],
"وَعَبَّادُ": [35],
"الْيَمَانِ": [[4,8]],
"فَأَحْسَنَ": [8],
"غَيْلَانُ": [23],
"alah": [[22,25]],
"penulis": [[0,41]],
"menghendaki": [22],
"وَاقِدِ": [14],
"amr": [[18,19]],
"dza\'bi": [2],
"paling": [[2,14]],
"benar-benar": [13],
"عَلِيُّ": [[1,5],[8,35]],
"عَلِيٌّ": [1,8,[4,10,22]],
"عَلِيٍّ": [1,14,[2,13,33]],
"tikar": [12,19],
"بَشَّارٍ": [[1,22,30],[14,24,28,29,33,34,36,38,39]],
"ana": [23,[3,27,30,31,35],[29,33,39],[13,22,25,26,34,37,38,40]],
"وَاقِدٍ": [[4,17]],
"maimun": [23],
"يعلمه": [12],
"kebaikan": [[1,22]],
"عَلِيِّ": [8],
"صالحًا": [12],
"صَدَقَاتِ": [4],
"اتَّبَعْنَاكَ": [28],
"hukum": [34],
"أَشْبَهَهُمْ": [14],
"قَطُّ": [22],
"فَكَانَ": [[1,11]],
"كَانُوا": [2],
"فَنَشُدَّ": [5],
"dulu": [15],
"hammadtelah": [35],
"jariku": [5],
"za\'idah": [7],
"muhrim": [14],
"bertahan": [40],
"فَتَحَهَا": [1],
"حَرْبٍ": [[12,18,19]],
"الصَّلَاةُ": [22],
"يَدُورُ": [22],
"perbaikilah": [31],
"maksud": [19],
"sugguh": [7],
"pasar": [25],
"dapati": [5],
"shallau": [14],
"حِينَ": [[2,8,30]],
"فَاحِشًا": [19],
"apa": [[1,33],[2,4,23,32]],
"alqamah": [12,19],
"تُفْرِغَانِهِ": [40],
"musawir": [34],
"فضائل": [0],
"حُبَّهُ": [10],
"menganggap": [37],
"أَزَالُ": [[18,38]],
"akhirat": [31,22],
"gelap": [35],
"يُرِيَانِهِ": [32],
"سَمَّانَا": [23],
"فَيُطْعِمُنَا": [2],
"نَاسٍ": [37],
"نَاسٌ": [11],
"مِرَارٍ": [27],
"sebaliknya": [10],
"قَوْمًا": [12],
"keadaanmu": [[1,25]],
"بِهَا": [[6,33]],
"حَرْمَلَةُ": [10],
"عُمُومَتِي": [39],
"mengutamakan": [[29,32,37]],
"malik": [30,[31,33],[5,12,13,14,22,26,27,29,37]],
"sebutkan": [8],
"الضَّعِيفُ": [10],
"يَكُنِ": [38],
"numair": [15],
"dibunuh": [[23,34]],
"benarlah": [23],
"يَكُنْ": [19,[1,14]],
"arrabi": [25],
"وَأَطَعْنَا": [25],
"sakiti": [22],
"asa": [10],
"berdiam": [7],
"فَضَرَبُوهُ": [5],
"harakat": [[12,19]],
"hajji": [5],
"ash": [8],
"dipandang": [10],
"حِينًا": [19],
"potong": [10],
"فَتُفْرِغَانِهِ": [40],
"tersebut": [1,35,[8,10,22,25,27,34]],
"individuali": [30],
"agung": [0],
"ata": [33,[1,4,10,14,19,31]],
"فَلَعَلَّهُمْ": [5],
"تَنْزِلَ": [1],
"makkah": [23],
"yassir": [12],
"kabarkan": [1],
"تَكُونُوا": [29],
"تَجْتَمِعُ": [8],
"كَأَنْ": [1],
"مَسَاءُ": [1],
"لِعَبْدِ": [25],
"ghundar": [[1,30],[14,22,24,28,29,33,34,36,38]],
"ظَلَمَ": [24],
"افْتَرَقَ": [23],
"al\'abba": [33],
"raka\'at": [20,[12,19]],
"mengenakan": [25,2],
"munkadir": [[5,15]],
"penyakit": [1],
"amalku": [7],
"سَمِعْتُهُ": [12],
"menemukannya": [10],
"auf": [25],
"nama": [[1,23],[18,38]],
"aisyah": [22,4,[1,9,10],[23,40]],
"disusunya": [0],
"aun": [[7,22]],
"aus": [34],
"تَذْرِفَانِ": [17],
"masjid": [[1,10],[11,12,34]],
"berbai\'at": [31],
"pedoman": [0],
"جَلَسَ": [[12,33]],
"keduanya": [14,35,[10,25,32,40],[6,34]],
"ابْنِي": [14],
"الْبَرَاءَ": [34,[14,26]],
"shahabatshahabatku": [22],
"عِنْدِي": [10],
"أُسَيْدٍ": [29,37],
"وَرَقُ": [7],
"الْأَشْعَرِيَّ": [19],
"أُسَيْدُ": [[22,35]],
"فَقُلْتُ": [[12,19,22]],
"الْأَشْعَرِيِّ": [22],
"نَوَاةٍ": [25],
"حَكَمْتَ": [34],
"أُسَيْدَ": [35],
"miskin": [2],
"نَوَاةً": [25],
"nanti": [25,30],
"target": [40],
"unta": [[1,7]],
"putuskanlah": [1],
"وَسَأَلَهُ": [14],
"yang": [1,[4,33],12,22,[19,23,25],10,7,[2,5,34],14,[9,11,29,32,40],[26,28,30],[8,18,24,27,31],[0,6,16,20,35],[13,21,37,38,39]],
"hikmah": [16],
"حُكْمِكَ": [34],
"ikatan": [4],
"أُسَيْدِ": [30],
"ghanimah": [23,1],
"لَكُنْتُ": [24],
"sebelahnya": [20],
"وَلِي": [25],
"humran": [20],
"بِهَذَا": [29],
"memerlukan": [32],
"أَنَّ": [1,10,[2,4],[3,5,8,11,13,15,19,22,24,29,30,32,34,35]],
"pelayan-pun": [2],
"harus": [34],
"harun": [[1,2]],
"pembawa": [[12,19]],
"harta": [4,[1,23]],
"صَحِبَ": [20],
"cara": [[4,7,14]],
"radliallahuanu": [14],
"sutera": [34],
"perantaraan": [3,1],
"فَيُحَدِّثُنَا": [23],
"hartaku": [25],
"عَامَّةَ": [1],
"ضَرْبَةٌ": [5],
"مِلْحَفَةٌ": [33],
"menikah": [25],
"memenuhi": [8],
"kalangan": [33,[7,10,22,30],[4,5,29,39]],
"masruq": [[18,19,36,38]],
"bukanlah": [19],
"لِلْإِمَارَةِ": [9],
"orang": [19,12,10,14,7,[2,25],[5,9,28,32,34,35,37],[1,8,13,26,29,30],[4,17,18,22,23,33,36,38,39,40]],
"diriku": [[4,7,8,21]],
"radiallahu": [14],
"sekali": [1],
"berhak": [33],
"masuknya": [23],
"hartamu": [25],
"فَرَأَيْتُ": [[11,19]],
"يَوْمِي": [22],
"shadaqah": [4,14],
"فَقَدَّمَهُ": [23],
"sepasang": [[12,19]],
"وَلَا": [2,10,[19,26]],
"ikut": [32],
"سَرَوَاتُهُمْ": [23],
"keluarga": [4,25],
"pokok": [2],
"لَقَرَابَةُ": [4],
"usaid": [29,35,[22,30,37]],
"عُبَيْدَةَ": [[1,13]],
"meyertai": [2],
"darda": [12],
"أَسْلَمَ": [7],
"خَيْرًا": [[1,22]],
"الْمُهَاجِرِينَ": [30],
"يَزِيدَ": [19,1],
"يَزِيدُ": [2],
"أَظُنُّهُ": [28],
"berserta": [35],
"زَيْدٍ": [10,[9,39],[14,17,27,33]],
"زَيْدَ": [28],
"زَيْدٌ": [28,17],
"membuat": [11],
"وَيَقِلُّونَ": [33],
"زَيْدِ": [28],
"الْعَرْشُ": [34],
"بِشِبَعِ": [2],
"الَّذِي": [12,[4,19,23,33],7],
"رواه": [[14,22],1,5,[4,7,10,19],[20,23,25,29,30,31,33,34],[2,6,9,11,12,13,15,26,27,28,38],[3,8,16,17,18,21,24,32,35,36,37,39,40]],
"فَسَارَّهَا": [4],
"أَيَّامٍ": [7],
"الْمُنْكَدِرِ": [[5,15]],
"adam": [31,[22,28]],
"pasangan": [32],
"profil": [41],
"يَوْمًا": [[10,22,23,25]],
"تُنْقِزَانِ": [40],
"mewariskan": [4],
"وَبَقِيَ": [33],
"sesuatu": [4,[12,22,25,32,33]],
"الْمُعْتَمِرُ": [14],
"سَمْتًا": [19],
"فَضَحِكَتْ": [4],
"أخذها": [17],
"تُشْرِفْ": [40],
"dimakannya": [4],
"نَبِيَّ": [[29,40]],
"لِينِ": [34],
"نَبِيٍّ": [[5,28]],
"أَسْأَلُ": [10],
"تَفَرَّقَا": [35],
"darah": [23],
"وَسَمَّانِي": [38],
"takbir": [1],
"هُمَا": [14],
"فَاسْقِنَا": [3],
"يُكَلِّمُ": [10],
"عُبَيْدٍ": [[1,15]],
"يَقُولُ": [[7,34],33,[14,22],[1,8,15,18,19,23,29,30,36,38]],
"رَجَعْتُ": [5],
"berdagang": [25],
"عُبَيْدُ": [22,[5,14,23]],
"فَقَصَصْتُهَا": [11],
"عُبَيْدِ": [31],
"saw": [0],
"وَأَخْبِرْهُمْ": [1],
"فَاضْطَجَعَ": [1],
"بَيْنَمَا": [10],
"menggembirakan": [9],
"menembus": [40],
"بَصَقَ": [1],
"menitikkan": [17],
"ma\'mar": [14,[10,11,16,27,35,40]],
"فَاغْفِرْ": [31],
"كَفَضْلِ": [22],
"bah": [14],
"مَخْلَدٍ": [[5,9,29]],
"أَخِيرًا": [29],
"laili": [12,19],
"hamzah": [28],
"menusukkan": [5],
"kelompok": [14],
"وَأُمَّ": [40],
"لِلْمُهَاجِرِينَ": [31],
"laila": [28,1],
"dipenggal": [14],
"وَتُسْبَى": [34],
"فَسَمِّهَا": [25],
"فَرَطِ": [22],
"addzakari": [12],
"سَعْدًا": [7],
"عَمْرِو": [[4,8,18,21,22,38]],
"terjemahannya": [0],
"mencarinya": [22],
"al-haudl": [30],
"humaid": [[17,25,29,31]],
"أَخَذَانِي": [11],
"dibandingkan": [22],
"bergilir": [22],
"سَعْدِ": [34,[1,25]],
"utusan": [4],
"سَعْدُ": [29,[34,37]],
"سَهْمٌ": [40],
"سَعْدَ": [7],
"سَعْدٍ": [1,[4,7,9,25]],
"قِلَادَةً": [22],
"سَعْدٌ": [29,25],
"ضُرِبَهَا": [5],
"فَطَأْطَأَ": [10],
"sahabat": [32,[0,1]],
"ammar": [12,22],
"وَتَرْجِعُونَ": [23],
"وَالصِّبْيَانَ": [27],
"sekalipun": [[25,32]],
"أَسْلَمْتُ": [7],
"kira": [[5,28]],
"hudzaifah": [[12,19],18,[13,36,38]],
"ubaidillah": [6],
"terbuat": [[22,34]],
"بَلَغَكَ": [23],
"bakrah": [14],
"sungkawa": [17],
"سَهْلٍ": [[29,31]],
"shahabat": [[5,10,22,23,34]],
"عَصَبَ": [33],
"kewajiban": [1],
"حَاشِيَةَ": [33],
"سَهْلِ": [1,34],
"perawi": [33,[9,10,18,23,27]],
"كِتَابٍ": [10],
"aulia": [0],
"فَسُرَّ": [9],
"خَتَنُ": [34],
"حِبُّ": [10],
"الْمُقَدَّمِيُّ": [6],
"عَلِمْتُ": [5],
"barakah": [22],
"kita": [15,[1,13,29,32]],
"shalih": [12,[11,19,34]],
"يَعْقُوبَ": [[14,33]],
"يَرَى": [1],
"يَعْقُوبُ": [27],
"مَسْرُوقٍ": [[18,36,38]],
"hijrah": [24],
"فَإِذَا": [[1,5,11,12,25]],
"keliru": [33],
"وَالْحَسَنَ": [[10,14,22]],
"وَالْحَسَنُ": [14],
"dirimu": [15],
"فَبَدَأَ": [[18,38]],
"asiyah": [22],
"سَكَنَ": [22],
"mendamaikan": [14],
"mengadukan": [[7,22]],
"فَقَعَدَ": [1],
"شَكَّ": [25],
"انْهَزَمَ": [40],
"tinggal": [29,22,37,[1,19,25]],
"menjilat": [2],
"وَبَرَكَاتُهُ": [22],
"ghasil": [33],
"menyuguhkan": [[2,32]],
"istri-istrinya": [22],
"seluruh": [[22,29],37],
"mengatakan": [28,7],
"الْأَقْدَامَ": [9],
"زَيْدًا": [17],
"lihatlah": [25],
"kebaikan-kebaikan": [1],
"الشَّرِيفُ": [10],
"pedang-pedangnya": [17],
"نَعَى": [17],
"bisyr": [35],
"debu": [1],
"لَيْثٌ": [10],
"نَحْرِي": [40],
"kehadirat": [0],
"adiy": [[14,26]],
"seandainya": [[10,24],[1,15,23]],
"wahyu": [22],
"بِيَدَيْهِ": [10],
"تُصْلِحُ": [32],
"مِمَّا": [1],
"bahagia": [11],
"kain": [34,33],
"ucapannya": [[0,37]],
"فِيهِمُ": [10],
"فِيهِمْ": [34],
"وَآيَةُ": [26],
"لَيْتَ": [10],
"kalian": [30,12,1,23,[19,34],[27,33],[5,9,22,29],[10,13,20,25,32,37]],
"فَانْظُرْ": [25],
"katakan": [[10,22]],
"aswad": [[19,20]],
"kepemimpinan": [9],
"نَزَلَ": [22],
"padanya": [25],
"terhadapku": [1],
"لِنَفْسِكَ": [15],
"menolong": [24],
"keledai": [34],
"kebun": [25],
"فُضَيْلِ": [32],
"waqid": [[4,14,17]],
"نَجْرَانَ": [13],
"bin": [10,14,[1,5,22],19,7,34,[3,9,18,38],[2,25,29,30],[12,33,35],[4,8,11,15,17,20,26],[27,36],[13,23,28,31,37,39],6,[21,24,32]],
"kaki": [1],
"diraja": [34],
"أَصْحَابَ": [5],
"بَرَكَةً": [22],
"untsaa": [12,19],
"baiknya": [19],
"utsman": [5,1,[6,10,14,20]],
"sulaiman": [[10,19],[9,11,12,18,29]],
"termasuk": [27],
"laki-lakiku": [19],
"alloohumma": [[3,12]],
"beberapa": [19],
"mahzum": [10],
"سَأَقْسِمُ": [25],
"kitaab": [38],
"fadak": [4],
"لِكُلِّ": [28,[5,13]],
"terdahulu": [37],
"kami": [1,22,14,[7,10],[5,28],[4,19,25,29],[31,33],23,[2,3,20,30],34,16,[11,13,15,27,35,37],[6,9,12,26,38],[32,40],[8,17,18,21,24,36,39]],
"وَنَنْقُلُ": [31],
"abdil": [29,37],
"وَالنَّاسُ": [33],
"جَهْدَكَ": [1],
"kamu": [25,1,[5,12,15,34],[10,11,19,22,29,32]],
"بِعَلِيٍّ": [[1,14]],
"mengatakanya": [5],
"رَمَى": [7],
"رَجُلٌ": [5,[1,10,11,18,19,32,34,38]],
"رَجُلٍ": [[8,10,19,23]],
"berjumpa": [30,11],
"أَهْلُ": [14],
"kamb": [25],
"أَهْلِ": [[4,12,19],[14,38]],
"selembar": [12],
"fudlail": [32],
"ceritanya": [1],
"kali": [1,5,27,[7,40]],
"خُمُسِ": [4],
"غَدًا": [[1,22]],
"orangtua": [[5,7]],
"فَتْحِ": [23],
"دَعْهُ": [20],
"يَدُوكُونَ": [1],
"amar": [22],
"فَحَدَّثَنِي": [8],
"mencari": [[0,1]],
"perutku": [2],
"amal": [1],
"berarti": [[4,21,22]],
"urwah": [5,[4,10],9],
"ghaylan": [23],
"masing-mas": [[1,35]],
"وَأَبُو": [[39,40]],
"jiwaku": [[4,5,27]],
"إِمَارَةِ": [9],
"alaihissalam": [14],
"ibrahim": [[7,12,14,19,25],[1,2,4,9,13,18,26,27,34,36,38]],
"أَفَاءَ": [4],
"berperang": [[6,7]],
"sampai": [23,17],
"النَّعْلَيْنِ": [[12,19]],
"bengkak": [1],
"لَيْسَ": [[2,4,14,29]],
"أَنَّهُمَا": [32],
"mengganjal": [2],
"malam": [32,11,[1,35]],
"لَيُخْرِجُ": [2],
"فَاجْهَدْ": [1],
"ذَهَبَ": [12],
"الْجِهَادِ": [31],
"ذَهَبٍ": [25],
"كَأَنَّ": [11],
"سُجُودَهُ": [10],
"puluh": [1],
"شَاذَانُ": [33],
"يَكْسِرُ": [40],
"terhormat": [10],
"tokoh": [23],
"فَعَالِكُمَا": [32],
"menikahinya": [25],
"tanduk": [11],
"قَدِمَ": [25],
"kurma": [25],
"فيسرك": [12],
"sehingga": [1,[0,2,7,19,40]],
"tentu": [10],
"أُغَيِّرُ": [4],
"فَطَعَنَ": [9],
"فَأَخْبَرَهُ": [33],
"muththalib": [3],
"hendak": [32,[8,22]],
"mendapat": [12],
"disukainya": [1],
"يُحِبُّهُ": [1],
"demi": [[4,5,8,22],[1,9,10,12,14,23,24,27,40]],
"رَأَى": [[10,11,27]],
"terlihat": [40],
"حَدِيثِهِمَا": [6],
"قَالَ": [1,5,12,25,14,19,10,[22,29],[30,33],[4,7,26,27,28],[23,38],[13,20,34],[8,9,11,31,37],[6,15,18],[2,3,16,21,24,39,40]],
"مُلَيْكَةَ": [20,[4,14,21]],
"wuhaib": [16],
"ubaidah": [13,1],
"خَصَاصَةٌ": [32],
"dzkara": [12],
"وَصَدَقَةُ": [14],
"ذَكَرْتُ": [22],
"menumpahkan": [23],
"masuk": [7,[10,19,22,37]],
"يَصْعَدْهُ": [33],
"قُرَيْشًا": [[10,23]],
"امْرَأَتَانِ": [25],
"وَهُمْ": [33],
"berbuat": [[19,23,33]],
"mengetahui": [[12,19],[4,5,9,22,25]],
"keadaan": [33,32],
"بُيُوتِهِمْ": [23],
"dzkari": [12],
"sebelumnya": [[1,5,11]],
"الْقَوْمِ": [40],
"ketiga": [7,22],
"يُحِبُّهُمْ": [26],
"ibnul": [13],
"بِعَمِّ": [3],
"الْجُهَنِيُّ": [2],
"fasqinaa": [3],
"زَوْجَتُهُ": [22],
"وَاحِدًا": [1],
"وَهُوَ": [10,14],
"وَالْآخِرَةِ": [22],
"وَجَعْفَرًا": [17],
"رِدَاءَهُ": [1],
"dusta": [1],
"abdurrazzaq": [14],
"tuan": [23],
"عَمِّكِ": [1],
"وَسَلَّمَ": [32,[1,4,14]],
"dihaf": [39],
"صِبْيَانَهَا": [32],
"kaum": [[23,28,29,33],[25,26,31],[1,5,24,30,37],[12,14,22,35]],
"دَارَ": [22],
"دَارُ": [29],
"hazim": [1,[6,31,32]],
"bilal": [15],
"melihatnya": [10,22],
"fatasqiinaa": [3],
"يَأْتِ": [5],
"وَخَلَصَ": [1],
"مَنْكِبَيْهِ": [33],
"jarrah": [13],
"kata": [[0,28]],
"قَتَلُوا": [14],
"amir": [[1,7]],
"fadlal": [34],
"فَوَاللَّهِ": [[1,22]],
"يَضُمُّ": [32],
"setia": [5],
"إِنَّهُ": [[5,20,34]],
"bukankah": [12,19],
"terpuji": [[1,2,4,5,7,9,11,12,13,14,15,17,18,19,21,23,34,35,36,37,38,39,40]],
"setan": [12,19],
"اجْعَلْ": [28],
"الْخُدْرِيِّ": [34],
"lumpuh": [6],
"بَعْدَهُ": [9],
"suami": [32],
"swt": [0],
"إِذَا": [12,19,[1,2,3,10,11,25,32]],
"لَمُشَمِّرَتَانِ": [40],
"tempat-tempat": [23],
"sementara": [[9,20,40]],
"وَزْنَ": [25],
"tidakkah": [[5,29,30]],
"سَلَّمَ": [2],
"وَلَوْ": [[25,32]],
"الذُّبَابِ": [14],
"merdeka": [7],
"تَطْلُبُ": [4],
"وَضَرٌ": [25],
"أَيْدِيهِمَا": [35],
"الذُّبَابَ": [14],
"penolong": [24],
"أَخَا": [10],
"pembaca": [0],
"pedang": [[17,40]],
"شَأْنُ": [10],
"ketika": [22,[10,14],[1,5,7,32],[3,4,8,19,23,25,30,31,34,35,40]],
"didengar": [8],
"kudanya": [5],
"عَهْدِ": [[4,11,39]],
"خَالِدٌ": [[4,6,13]],
"خَالِدٍ": [16,[2,6]],
"خَالِدُ": [[5,7,9,29]],
"laki-laki": [1,5,32,[2,8,10,11,22,23,35,40]],
"syu": [14],
"parah": [5],
"بَلْ": [23],
"bersyahadat": [8],
"mengulanginya": [10],
"setuju": [34],
"firman": [12,[0,19,32]],
"menurunkan": [[3,32]],
"يُصَلِّي": [[7,11]],
"يُضِيفُ": [32],
"wasallam": [1,[4,22],19,14,[12,29],[10,11,23,25,34],[5,31,33],[8,9,32],[6,26,27,40],[2,7,13,20,24,30,35,37,38],[16,17,18,21,28,36,39]],
"سَأَلْتُمَانِي": [1],
"عُمَرَ": [10,[11,14],[1,2,3,4,9,19,20]],
"تَطْعُنُونَ": [9],
"عُمَرُ": [[14,15]],
"menghalanginya": [5],
"وَلَدَتْهُ": [10],
"diwarnai": [14],
"وُضُوءٍ": [22],
"sekaligus": [9],
"تُقْتَلَ": [34],
"hormat": [0],
"تَقُولُ": [31],
"بِالْعَبَّاسِ": [3],
"الصحابة": [0],
"فِرْعَوْنَ": [22],
"pundaknya": [[5,33]],
"sahal": [1,[31,34]],
"وَلَمْ": [[22,33]],
"namun": [[1,22],15],
"terkena": [[1,5]],
"hadi": [0],
"وَمَعَهُ": [25],
"sisa": [4],
"فَأَكْرِمْ": [31],
"memulainya": [18],
"مُسِيئِهِمْ": [33],
"بَيْنَ": [[14,25,34,35,40]],
"bagilah": [25],
"فَرَآهُ": [10],
"putra": [2,[1,5,14]],
"a\'raj": [25],
"majisyun": [10],
"sepeningg": [30],
"keputusan": [34],
"أُتِيَ": [14],
"بَرْدَ": [1],
"pendapat": [1,[19,20]],
"saat": [22,[1,5,11,14,33]],
"ar\'arah": [34],
"جَنْبِهِ": [14],
"dewi": [0],
"وَذَكَرَ": [[4,8]],
"amru": [[28,38],[22,36],[2,4,7,8,13,18,20,21,29]],
"عَرْشُ": [34],
"marwan": [5],
"إِذًا": [7],
"membebaskan": [15],
"ma\'in": [14],
"muhajirin": [31,[25,32],30],
"tawanan": [[1,34]],
"shalat": [20,[10,22],[11,12,19]],
"sempurna": [22],
"sujudnya": [10],
"لَقَطَعْتُ": [10],
"badan": [40],
"sampaikan": [[1,22],28],
"الْأَيَّامِ": [6],
"badar": [5],
"shallallahu\'alaihiwasallam": [[3,4,34]],
"dirinya": [30,[14,32]],
"لِجَابِرٍ": [34],
"حَيِينَا": [31],
"وَعَنْ": [34],
"وَقِيلَ": [5],
"عَرَفْتُهُمْ": [11],
"yaman": [[4,8,12,19]],
"سَيْفٌ": [17],
"غَيْرِهَا": [22],
"suatu": [33,[2,10,11,20,22,25]],
"ابْنِ": [[1,2,4,11,14],[8,10,16,19,20,21,22,28,36]],
"ابْنُ": [10,[1,5,20,22],[4,6,7,11,12,14,15,17,19,21,31,33]],
"ابْنَ": [[2,14],[1,20,33]],
"بَهْزُ": [27],
"أَلْعَبُ": [5],
"عَمْرٍو": [36,[18,19,28,38]],
"اسْمٌ": [1],
"dilahirkan": [10],
"اسْمَ": [23],
"menamakanya": [23],
"mempekerjakan": [30],
"bidikannya": [40],
"tak": [[1,7]],
"فُلَانَةُ": [2],
"lampunya": [32],
"مُتَعَطِّفًا": [33],
"بَيْتِهِ": [4,[2,14]],
"غَيْرُهُ": [12,19],
"mula-mula": [22],
"عَمْرٌو": [[22,28]],
"حَاتِمٌ": [1],
"كُلُّهُمْ": [[1,39]],
"dimaksud": [[16,22]],
"abdul": [22,[1,3,27,40],[4,5,7,13,15]],
"الثَّرِيدِ": [22],
"dijawab": [29],
"abdur": [25,10,[11,19,22]],
"تُوُفِّيَ": [4],
"terkagum-kagum": [34,32],
"عَمْرُو": [[2,7,13,20,28,29]],
"الْيَرْمُوكِ": [5],
"parit": [31],
"ثُمّ": [12],
"ضَمَّنِي": [16],
"sayap": [2],
"natawassalu": [3],
"الطَّلْحِيُّ": [29],
"النَّبِيِّ": [11,4,[19,33],[1,10,29,34,35,40],[5,6,7,12,14,24,26,31,39]],
"النَّبِيُّ": [1,9,[4,27,30],[5,7,13,14,16,19,25,26,28,29,33,34,38,40]],
"ذِئْبٍ": [2],
"النَّبِيَّ": [29,[14,34],[1,6,8,10,11,17,20,22,23,26,32,36,38]],
"putri": [8,[4,14]],
"والله": [1],
"basysyar": [[1,22,30],[14,24,28,29,33,34,36,38,39]],
"وَجَدْتُهُ": [10],
"perbuatan": [[0,32]],
"peliharalah": [[4,14]],
"أَفْوَاهِ": [40]
};
