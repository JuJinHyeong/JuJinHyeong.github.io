---
title: "C++ 타입 캐스팅"
excerpt: "C++의 타입 캐스팅에 대한 설명입니다."
categories:
  - Back To Basics
tags:
  - c++
  - opeartor
  - casting
---
> ! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 에서 진행했습니다.
{: .notice--info}

# 개요
c++에서 **타입을 다른 타입으로 변환**해주는 것은 캐스팅이라고 한다.  
아래에서는 **캐스팅의 종류**와 각 **캐스팅의 특징**과 **사용 방법**에 대해서 설명한다.  

# 종류
## 암시적 캐스팅 (implicit casting)
캐스팅 연산자를 사용하지 않고 자동으로 캐스팅 되는 경우는 모두 암시적 캐스팅이다.
```cpp
int i = 92;
char c = i; // implicit casting
if(c) { // implicit casting
    c = 'a';
}
```
## 명시적 캐스팅 (explicit casting)
### c 스타일 캐스팅 (T)
> `(target-type)expression`

c에서 사용하는 캐스팅으로 c++의 캐스팅 기능 중 여러 기능이 합쳐져있다.
```c
int i = 92;
char c = (char)i;
char* c = (char*)&i;
```


### dynamic_cast
> `dynamic_cast<target-type>(expression)`

#### 조건
`target-type`이 반드시 **포인터나 레퍼런스**여야한다.  
expression은 target-type 가 포인터라면 반드시 포인터여야하고, 레퍼런스라면 반드시 lvalue 여야한다.

#### 작동방식
RTTI를 키면 변환할 수 있는지 없는지 런타임에 체크한다. 아니라면 static_cast와 동일하게 작동한다.

#### 결과
`target-type`이 포인터 일 때 캐스팅이 가능하면 캐스팅을 수행하고 **아니면 null 을 반환**,  
`target-type`이 reference일 때 가능하면 캐스팅을 수행하고 **실패할 경우 std::bad_cast exception를 throw 한다**.  

#### RTTI
RTTI는 runtime type information으로 컴파일할 때 /RG 옵션을 키면 런타임에 개체의 자료형에 대해서 알 수 있는 정보를 만들어낸다.

RTTI 가 작동하는 방식은 `vptr` 에 저장된 RTTI 정보를 들고와서 포인터의 실제 `typeid`를 얻어내는 방식으로 사용된다.

> **즉 RTTI 옵션을 사용하기 위해서는 `virtual function`이 필수적이다.**

#### 예제
명확하게 변환할 수 있는 캐스팅을 수행할 때 ( upcasting )
```cpp
// no RTTI
class B { };
class C : public B { };
class D : public C { };

void f(D* pd) {
	C* pc = dynamic_cast<C*>(pd); // ok, same with static_cast
	B* pb = dynamic_cast<B*>(pd);   // ok, same with static_cast
}
```



### static_cast
> `static_cast<target-type>(expression)  `

`expression`을 `target-type` 로 변환하는 연산자이다. 
**형 변환이 가능한지 아닌지를 컴파일타임에 체크**한다. 일반적으로 위에서 보여준 **c 스타일 캐스팅과 가장 비슷하게 쓰인다.** 하지만 다양한 방식으로 사용될 수 있고 위험한 점도 있기 때문에 아래에서 여러 예제를 통해 좀 더 자세하게 확인해보자.

#### numeric 값 캐스팅
float, int, enum 같은 numeric 값을 다른 numeric 으로 변경할 때 쓰인다.
```cpp
enum E {
	ONE = 1,
	TWO = 2,
	THREE = 3
};

void func() {
	int i = 2;
	E e = static_cast<E>(i);
    float f = static_cast<float>(i);
}
```

#### void 캐스팅 / nullptr
**모든 타입은 `void` 로 변환 가능하다.** 그리고 `void` 로 변환하면 그 expression의 값을 버린다.  
( 이 기능은 왜 필요한지 잘 모르겠습니다. 댓글로 추가 의견 부탁드립니다. )
```cpp
void func() {
	int a;
	static_cast<void>(a);
}
```
**`void*` 는 모든 포인터 타입으로 변환 가능하다.**
```cpp
void func() {
    int a = 10;
    void* pv = &a; // implicit casting
    float* pf = static_cast<float*>(pv); 
}
```
**`nullptr` 은 `nullptr` 로 변환된다.**
```cpp
void func() {
	int* pi = static_cast<int*>(nullptr);
}
```

#### 포인터 캐스팅
아래 예제는 `static_cast`의 `down casting`과 `up casting` 대해서 보여준다.
```cpp
class B {};
class D : public B {};

void f(B* pb, D* pd) {
    // down casting
    D* pd2 = static_cast<D*>(pb);   // Not safe, D can have fields
                                    // and methods that are not in B.
    // up casting
    B* pb2 = static_cast<B*>(pd);   // Safe conversion, D always
                                    // contains all of B.
}
```
`static_cast`는 타입 변환만을 체크하므로 **`D`가 `B`에는 없는 메모리를 가지고 있으면 위험할 수 있다.** `pd2`에서 `D`만 가지고 있는 함수를 불러오거나 하면 잘못된 메모리를 접근할 수 있다. 이 때는 `dynamic_cast`를 사용해서 안전하게 `down casting` 할 필요가 있다.

`dynamic_cast`를 사용하지 않을 때 생기는 문제를 보여주는 추가적인 예제이다.
```cpp
// compile with: /LD /GR
class B {
public:
   virtual void Test(){}
};
class D : public B {};

void f(B* pb) {
   D* pd1 = dynamic_cast<D*>(pb);
   D* pd2 = static_cast<D*>(pb);
}
```
이 예제는 `dynamic_cast`와 `static_cast` 차이점을 보여준다. `pb`의 실제 개체가 `D`인지 `B`인지는 알 수 없는 상태에서 `dynamic_cast`는 캐스팅이 불가능하면 `null`을 반환하므로 안전한 반면에, **`static_cast`를 할 경우에는 잘못된 메모리 접근을 초래할 수 있다.** `static_cast`를 사용하면 **프로그래머가 안전한지 아닌지를 판단할 수 밖에 없다.**

위와 같은 문제는 일반적인 primitive 타입을 사용할 때도 비슷하게 일어날 수 있다.

```cpp
void f() {
   char ch;
   int i = 65;

   ch = static_cast<char>(i);   // int to char
}
```
**`int` 를 `char` 로 변환할 때는 3byte를 잃어버리게 된다.** 이러한 경우들을 전부 프로그래머가 알아서 처리해줘야한다.

#### 주의할 점
`static_cast`는 `const`, `volatile`, `__unaligned` 키워드를 없에지 못한다. 반대로 붙이는 건 가능하다.

### reinterpret_cast
> `reinterpret_cats<target-type>(expression)`

`expression`을 `target-type`으로 해석하게 하는 연산자이다.  
완전 low-level로 형변환을 하기 때문에 일반적으로는 사용하지 않는 것이 좋다.  
**형 변환이 가능한지 아닌지 체크하지 않는 캐스팅**이다.

**예제**
```cpp
struct Vec3f {
	float x, y, z;
};

struct Float3 {
	float x, y, z;
};

int main() {
	Vec3f a = { 1.0f, 2.0f, 3.0f };
	Float3* b = reinterpret_cast<Float3*>(&a);
	Float3* c = static_cast<Float3*>(&a); // error
	a.x = 10.0f;
	return 0;
}
```


### const_cast
> `const_cast<target-type>(expression)`

타입에서 `const, volatile, __unaligned` 를 제거한다. 제거한 후 **자기 자신을 반환한다.**

**예제**
```cpp
class A {
public:
	void Inc() const {
		const_cast<A*>(this)->num++;
	}
private:
	int num;
};
```
this의 type이 `const A*` 이므로 const 함수 안에서 변경하려면 const_cast로 변환이 필요하다.

위의 예시를 보아서 알 수 있듯, 매우 위험한 casting이다. 최대한 사용하지 않도록 하자.

## 스마트 포인터 캐스트

unique_ptr와 같은 smart pointer는 객체이므로 그 자체로 포인터를 가진다. 그래서 일반적인 캐스팅이 아닌 다른 캐스팅이 필요하다.  
물론 가능은하다. `static_cast<void*>(pointer.get())` 과 같은 방법으로...

### static_pointer_cast
> `static_pointer_cast<target-type>(expression)`

static_cast와 특징은 동일하다.

### dynamic_pointer_cast
> `dynamic_pointer_cast<target-type>(expression)`

dynamic_cast와 특징은 동일하다.

### const_pointer_cast
> `const_pointer_cast<target-type>(expression)`

const_cast와 특징은 동일하다.

## class 내부 캐스팅
캐스팅은 연산자이기 때문에 class내부에서 overloading이 가능하다.
> `operator Type() {}`

**예시**
```cpp
#include<iostream>
#include<string>
using namespace std;

class BigInt {
public:
    BigInt(const string& value) : value(value) {}
    operator long long() const {
        return stoll(value);
    }
private:
    string value;
};

int main() {
    BigInt a("123123");

    long long b = a; // implicit casting
    long long c = static_cast<long long>(a); // explicit casting

    cout << b << ' ' << c << endl;

    return 0;
}
```

## 리터럴 캐스팅
c++에는 앞이나 뒤에 간단한 문자를 붙여서 캐스팅하는 방식이 있다. ex) `1.0f, L"string"`

이 캐스팅을 사용자가 정의해서 사용하는 방법도 있다.
> `T operator"" str(params...)`

**예제**
```cpp
#include <iostream>
#include <string>

struct Distance
{
private:
    explicit Distance(long double val) : kilometers(val)
    {}

    friend Distance operator"" _km(long double val);
    friend Distance operator"" _mi(long double val);

    long double kilometers{ 0 };
public:
    const static long double km_per_mile;
    long double get_kilometers() { return kilometers; }

    Distance operator+(Distance other)
    {
        return Distance(get_kilometers() + other.get_kilometers());
    }
};

const long double Distance::km_per_mile = 1.609344L;

Distance operator"" _km(long double val)
{
    return Distance(val);
}

Distance operator"" _mi(long double val)
{
    return Distance(val * Distance::km_per_mile);
}

int main()
{
    Distance d{ 402.0_km }; // construct using kilometers
    std::cout << "Kilometers in d: " << d.get_kilometers() << std::endl; // 402

    Distance d2{ 402.0_mi }; // construct using miles
    std::cout << "Kilometers in d2: " << d2.get_kilometers() << std::endl;  //646.956

    Distance d3 = 36.0_mi + 42.0_km;
    std::cout << "d3 value = " << d3.get_kilometers() << std::endl; // 99.9364

    // Distance d4(90.0); // error constructor not accessible
    return 0;
}
```

## 참고
[마이크로소프트 - 형변환](https://learn.microsoft.com/ko-kr/cpp/cpp/casting-operators?view=msvc-170)  
[마이크로소프트 - RTTI](https://learn.microsoft.com/ko-kr/cpp/cpp/run-time-type-information?view=msvc-170)  
[마이크로소프트 - 문자 리터럴](https://learn.microsoft.com/ko-kr/cpp/cpp/string-and-character-literals-cpp?view=msvc-170)  
[마이크로소프트 - 숫자 리터럴](https://learn.microsoft.com/ko-kr/cpp/cpp/numeric-boolean-and-pointer-literals-cpp?view=msvc-170)  
[마이크로소프트 - 사용자 정의 리터럴](https://learn.microsoft.com/ko-kr/cpp/cpp/user-defined-literals-cpp?view=msvc-170)