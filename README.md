# 打谱机语法

## 字符及其意义

### 唱名

```
1, 2, 3, 4, 5, 6, 7
```
### 音名

```
C, D, E, F, G, A, B
```
### 乐谱符号

```
b - 升调符号
# - 降调符号
/ - 音长减半
* - 音长翻倍
. - 音长加一拍
- - 音高降低
+ - 音高升高
0 - 修止符号
```

### 控制符号

#### 头部符号（只能放在正文开头）

```
title = "标题名"
composer = "作曲者姓名"
compiler = "打谱者姓名"
bpm = a // 每分钟节拍数(beats per minute)。默认为80, 0<a
beatInfo = {a/b} // 表示每小节有a拍，b分音符为1拍。默认为4/4, a={2,3,4,5,6,7,8}, b={1,2,4,8,16,32,64}
1 = C // 唱名和音名的对应关系。默认为1=C
```

