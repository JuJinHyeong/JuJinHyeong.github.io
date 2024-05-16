---
title: "C++ 타입 캐스팅"
categories:
  - Back To Basics
tags:
  - c++
  - 연산자
  - opeartor
  - 캐스팅
  - casting
---
> ! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}

# 개요
c++에서 **타입을 다른 타입으로 변환**해주는 것은 캐스팅이라고 한다.  
아래에서는 **캐스팅의 종류**와 각 **캐스팅의 간단한 특징**과 **사용 방법**에 대해서 설명한다.  
이후에 추가적인 설명이 필요한 캐스팅에 대해서 좀 더 자세한 내용을 포스팅 할 예정이다.

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
> `(type_id)expression`

c에서 사용하는 캐스팅으로 c++의 캐스팅 기능 중 여러 기능이 합쳐져있다.
```c
int i = 92;
char c = (char)i;
char* c = (char*)&i;
```
### static_cast
> `static_cast<type_id>(expression)  `

expression을 type_id 로 변환하는 연산자이다. 
**형 변환이 가능한지 아닌지를 컴파일타임에 체크**한다.  
그래서 포인터를 캐스팅할 때 항상 안전하지는 않다.

**예제**
```cpp
int i = 92;
char c = static_cast<char>(i);
char* c = static_cast<char*>(&i); // error!
```
### reinterpret_cast
> `reinterpret_cats<type_id>(expression)`

expression을 type_id로 해석하게 하는 연산자이다.  
**형 변환이 가능한지 아닌지 체크하지 않는 캐스팅**이어서 조심해서 사용해야한다. 

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

### dynamic_cast
> `dynamic_cast<type_id>(expression)`

type_id 가 반드시 **포인터나 레퍼런스**여야한다.  
expression은 type_id 가 포인터라면 반드시 포인터여야하고, 레퍼런스라면 반드시 lvalue 여야한다.

**캐스팅이 가능하면 캐스팅을 수행하고 아니면 nullptr 을 반환하는 캐스팅**이다. RTTI를 키면 변환할 수 있는지 없는지 런타임에 체크한다. 아니라면 static_cast와 동일하게 작동한다.

**예제**  
static_cast 처럼 사용될 때
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

런타임 체크로 nullptr이 리턴될 때
```cpp
// RTTI
class B { virtual void f() {}; };
class D : public B { virtual void f() {}; };

void f() {
	B* pb = new D;   // unclear but ok
	B* pb2 = new B;

	D* pd = dynamic_cast<D*>(pb);   // ok
	D* pd2 = dynamic_cast<D*>(pb2);   // null
}
```

RTTI를 켰지만 virtual function이 없을 때 ( RTTI가 제대로 작동하지 않음. )
```cpp
// RTTI
class B {  };
class D : public B {  };

void f() {
	B* pb = new D;   // unclear but ok
	B* pb2 = new B;

	D* pd = dynamic_cast<D*>(pb); // compile error
	D* pd2 = dynamic_cast<D*>(pb2); // compile error
}
```

### const_cast
> `const_cast<type_id>(expression)`

타입에서 `const, volatile, __unaligned` 를 제거한다.

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
> `static_pointer_cast<type_id>(expression)`

static_cast와 특징은 동일하다.

### dynamic_pointer_cast
> `dynamic_pointer_cast<type_id>(expression)`

dynamic_cast와 특징은 동일하다.

### const_pointer_cast
> `const_pointer_cast<type_id>(expression)`

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