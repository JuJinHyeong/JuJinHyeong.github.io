---
title: "[C++] 타입 캐스팅"
excerpt: "c++의 타입 캐스팅에 대한 설명입니다."
categories:
  - Back To Basics
tags:
  - c++
  - opeartor
  - casting
  - syntax
---
> ! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 (v143) 으로 진행했습니다.
{: .notice--info}

# 개요
c++에서 **타입을 다른 타입으로 변환**해주는 것은 캐스팅이라고 한다.  
아래에서는 **캐스팅의 종류**와 각 **캐스팅의 특징**과 **사용 방법**에 대해서 설명한다.  

**필요지식**: 다형성, 객체 프로그래밍
{: .notice--warning}  

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

#### 요약
c에서 사용하는 캐스팅으로 c++의 캐스팅 기능 중 여러 기능이 합쳐져있다.
#### 예시
```c
int i = 92;
char c = (char)i;
char* c = (char*)&i;
```
---
### dynamic_cast
> `dynamic_cast<target-type>(expression)`

#### 요약
`dynamic_cast`는 `expression`을 `target-type`으로 **RTTI를 이용해서 안전하게** 캐스팅한다. RTTI가 없다면 `static_cast`와 동일하다.

#### 조건
`target-type`이 반드시 **포인터나 레퍼런스**여야한다.  
`expression은` `target-type` 가 포인터라면 반드시 포인터여야하고, 레퍼런스라면 반드시 `lvalue` 여야한다.

#### 결과
`target-type`이 포인터 일 때 캐스팅이 가능하면 캐스팅을 수행하고 **아니면 null 을 반환**,  
`target-type`이 `reference`일 때 가능하면 캐스팅을 수행하고 **실패할 경우 std::bad_cast exception를 throw 한다**.  

#### RTTI
RTTI는 runtime type information으로 컴파일할 때 `/RG` 옵션을 키면 런타임에 개체의 자료형에 대해서 알 수 있는 정보를 만들어낸다.

RTTI 가 작동하는 방식은 `vptr` 에 저장된 RTTI 정보를 들고와서 포인터의 실제 `typeid`를 얻어내는 방식으로 사용된다.

> **즉 RTTI 옵션을 사용하기 위해서는 `virtual function`이 필수적이다.**

#### 사용 가능 조건
기본은 포인터로 설명하되, reference의 경우에 설명이 필요하면 추가한다. 예제 코드에서 사용되는 class 구조이다.
{: .notice--info}
```
        BaseClass
       /         \
      V           V
   Left          Right
       \        /
        V      V
       MostDerived
```
1. **타입이 동일한 경우**  
   `expression`의 타입과 `target-type`이 동일하거나 `const`가 없고 동일할 때는 `target-type`이 된다.
   ```cpp
    MostDerived d;
    const MostDerived* cpd = dynamic_cast<MostDerived*>(&d); // add const
   ```
2. **nullptr인 경우**  
   `expression`이 `nullptr` 이면 `target-type`인 `nullptr` 이 된다.
   ```cpp
    MostDerived* pdn = nullptr;
    Base* pb = dynamic_cast<Base*>(pdn); // nullptr
   ```
3. **업캐스팅**  
   `target-type`이 Base의 포인터이고, `expression`의 타입이 `Derived`에 대한 포인터인 경우는 `Derived` 개체 내의 `Base` 클래스 서브 개체에 대한 포인터가 된다.
   ```cpp
   Right* pr = &d; // up-casting
   ```
4. **`void*`로 캐스팅**  
   `void*`로 캐스팅되지만 실제로는 `expression`이 가리키는 개체에 대한 포인터가 된다.
   ```cpp
   void* pv = dynamic_cast<MostDerived*>(&d);
   ```
5. **다운캐스팅/사이드캐스팅**  
   `expression`이 `Base`에 대한 포인터이고 `target-type`이 `Derived`에 대한 포인터인 경우에 런타임 검사가 수행된다.  
   a) **다운캐스팅**  
   `expression`이 가리키는 Most Derived Object를 검사한다. 그 개체에서 파생된 `Derived` 개체가 있으면 **캐스팅 결과는 `Derived` 개체를 가리킨다.**  
   간단하게 `expression`이 가리키는 원래의 object가 `Derived` 개체를 포함하면 캐스팅 수행한다.  
   ```cpp
   MostDerived* pd = dynamic_cast<MostDerived*>(pr); // down-casting
   ```
   b) **사이드캐스팅 / 크로스캐스팅**  
   파생된 `Derived` 개체가 없으면 `Base`에서부터 맞는 `Derived` 개체가 있는지 체크하고 있다면 **캐스팅 결과는 그 `Derived` 개체를 가리킨다.**  
   ```cpp
   Left* pl = dynamic_cast<Left*>(pr); // side-casting. right to left
   ```
   c) **실패**  
   위 두가지를 실패하면 런타임 검사가 실패한다. `target-type`의 `nullptr`를 반환한다. 참조일 경우에는 `std::bad_cast`를 throw 한다.

#### 예제 코드
```cpp
#include <assert.h>
class Base {
public:
    virtual ~Base() {}
};
class Left : virtual public Base { };
class Right : virtual public Base { };
class MostDerived  : public Left, public Right { };
int main() {
    MostDerived d;
    const MostDerived* cpd = dynamic_cast<MostDerived*>(&d); // add const
    Right* pc = &d; // up-casting
    MostDerived* pd = dynamic_cast<MostDerived*>(pc); // down-casting
    Left* pb = dynamic_cast<Left*>(pc); // side-casting
    MostDerived* pdn = nullptr;
    Base* pb = dynamic_cast<Base*>(pdn); // nullptr
    void* pv = dynamic_cast<MostDerived*>(&d);
    assert(pd && pl && !pb && pv);
    return 0;
}
```

---
### static_cast
> `static_cast<target-type>(expression)  `

#### 요약
`expression`을 `target-type` 로 변환하는 연산자이다. 
**형 변환이 가능한지 아닌지를 컴파일타임에 체크**한다. 일반적으로 위에서 보여준 **c 스타일 캐스팅과 가장 비슷하게 쓰인다.**

#### 사용조건
```
class B{ public: int x = 10; };
class D : public B { };
```
1. **다운캐스팅**  
   `target-type` 이 **가상함수가 없는** `Derived` 를 가리키고, `expression`은 `Base`의 포인터일 때 다운캐스팅을 실행한다. `static_cast`에서의 다운캐스팅은 안정성을 보장할 수 없기 때문에 잘못된 메모리 참조가 일어날 수 있다. 반드시 프로그래머가 체크해야한다.  
   이와 비슷하게 numeric 변환을 할 때도 다운캐스팅과 같은 안정성 보장이 되지 않는다. ( `double` -> `float` )
   ```cpp
   B b;
   D* pd = static_cast<D*>(&b);
   ```
2. **암시적 캐스팅**  
   `expression`에서 `target-type`으로의 변환 방식이나 개체의 초기화가 가능하면 초기화된 임시 변수를 반환한다.
   ```cpp
    float f = 3.14f;
    int i = static_cast<int>(f); // implicit casting (float -> int)
   ```
3. **rvalue 참조 캐스팅**  
   `target-type`이 `rvalue reference`이고, `expression`의 타입과 호환되면 `xvalue`로 변환한다. ( 이는 `std::move` 로 이미 정의되어 있다. )
   ```cpp
   int x = 5;
   int&& r = static_cast<int&&>(x);
   int&& r2 = std::move(x);
   ```
4. **void 캐스팅**  
   `target-type`이 `void` 인 경우 표현식의 값을 계산하고 결과값을 버린다.  
   ```cpp
   int x = 5;
   void* ptr = &x;
   int* pi = static_cast<int*>(ptr);
   ```
5. **숫자 타입 캐스팅**  
   `enum`, `int` 등과 같은 정수타입끼리는 캐스팅이 가능하다.
   ```cpp
   enum COLOR { RED = 1, BLUE = 2, GREEN = 3, };
   char c = 2;
   int i = static_cast<int>(c); // integer casting
   COLOR color = static_cast<COLOR>(i); // enum casting
   ```
6. **부동 소수점 타입 캐스팅**  
   `float`, `double` 과 같은 부동 소수점끼리는 캐스팅이 가능하다.
   ```cpp
   float f = 3.14f;
   double d = static_cast<float>(f);
   ```
7. **멤버 포인터 업캐스팅**
   특정 클래스 `Derived` 의 `Base` 멤버 포인터는 기본 클래스 `Base`의 멤버 포인터로 업캐스트 될 수 있다.  

   멤버 포인터는 멤버의 위치를 가리키는 포인터이다. 실제 값을 포인팅하지 않는다.
   {: .notice--info}

    ```cpp
    int D::* dp = &D::x;
    int B::* bp = static_cast<int B::*>(dp); // member pointer upcasting
    cout << d.*bp << endl; // print 10
    ```
8. **`void*` 캐스팅**  
    `void*` 타입의 `prvalue`는 임의의 개체 타입으로 캐스팅 가능하다.
    ```cpp
    void* ptr = &x;
    int* intPtr = static_cast<int*>(ptr); // void* -> int*
    ```

#### 주의할 점
`static_cast`는 `const`, `volatile`, `__unaligned` 키워드를 없에지 못한다.  
반대로 붙이는 건 가능하다.

#### 예제 코드
```cpp
class B { public: int x = 10; };
class D : public B { };
enum COLOR {
    RED = 1,
    BLUE = 2,
    GREEN = 3,
};
int main() {
    D d;
    B* pb = static_cast<B*>(&d); // down casting

    float f = 3.14f;
    int i = static_cast<int>(f); // implicit casting

    i = 5;
    int&& r = static_cast<int&&>(i); // rvalue reference casting
    r = std::move(i);

    void* ptr = &i;
    int* pi = static_cast<int*>(ptr); // void* -> int*

    char c = 2;
    i = static_cast<int>(c); // integer casting
    COLOR color = static_cast<COLOR>(i); // enum casting

    double db = static_cast<float>(f);

    static_cast<void>(i); // void casting

    int D::* dp = &D::x;
    int B::* bp = static_cast<int B::*>(dp); // member pointer upcasting
    cout << d.*bp << endl;

    return 0;
}

```

---
### reinterpret_cast
> `reinterpret_cats<target-type>(expression)`

#### 요약
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
	//Float3* c = static_cast<Float3*>(&a); // error
	a.x = 10.0f;
    cout << b->x << endl; // print 10.0
	return 0;
}
```

---
### const_cast
> `const_cast<target-type>(expression)`

#### 요약
타입에서 `const, volatile, __unaligned` 를 제거한다. 제거한 후 **자기 자신을 반환한다.**

#### 예제
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
#### 요약
캐스팅은 연산자이기 때문에 class내부에서 overloading이 가능하다.
> `operator Type() {}`

#### 예시
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
#### 요약
c++에는 앞이나 뒤에 간단한 문자를 붙여서 캐스팅하는 방식이 있다. ex) `1.0f, L"string"`

이 캐스팅을 사용자가 정의해서 사용하는 방법도 있다.
> `T operator"" str(params...)`

#### 예제
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
[Microsoft Learn - casting](https://learn.microsoft.com/ko-kr/cpp/cpp/casting-operators?view=msvc-170)  
[Microsoft Learn - static_cast](https://learn.microsoft.com/en-us/cpp/cpp/static-cast-operator?view=msvc-170)  
[cpp reference - static_cast](https://en.cppreference.com/w/cpp/language/static_cast)  
[Microsoft Learn - dynamic_cast](https://learn.microsoft.com/en-us/cpp/cpp/dynamic-cast-operator?view=msvc-170)  
[cpp reference - dynamic_cast](https://en.cppreference.com/w/cpp/language/dynamic_cast)  
[Microsoft Learn - reinterpret_cast](https://learn.microsoft.com/en-us/cpp/cpp/reinterpret-cast-operator?view=msvc-170)  
[Microsoft Learn - const_cast](https://learn.microsoft.com/en-us/cpp/cpp/const-cast-operator?view=msvc-170)  
[Microsoft Learn - RTTI](https://learn.microsoft.com/ko-kr/cpp/cpp/run-time-type-information?view=msvc-170)  
[Microsoft Learn - string literals](https://learn.microsoft.com/ko-kr/cpp/cpp/string-and-character-literals-cpp?view=msvc-170)  
[Microsoft Learn - numeric literals](https://learn.microsoft.com/ko-kr/cpp/cpp/numeric-boolean-and-pointer-literals-cpp?view=msvc-170)  
[Microsoft Learn - user defined literals](https://learn.microsoft.com/ko-kr/cpp/cpp/user-defined-literals-cpp?view=msvc-170)