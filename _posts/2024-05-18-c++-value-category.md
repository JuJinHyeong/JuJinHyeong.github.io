---
layout: single
title: "[C++] value category ( lvalue vs rvalue )"
excerpt: "c++의 value category를 정리하는 글입니다."
categories:
  - Back To Basics
tags:
  - c++
  - lvalue
  - rvalue
  - value category
---
! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 에서 진행했습니다.
{: .notice--info}

## 개요
이 글에서는 c++의 value category의 정의와 각 category의 특징과 예제에 대해서 설명한다.  

## lvalue와 rvalue의 정의
### lvalue
lvalue는 operator= 에서 왼쪽에 들어갈 수 있는 값을 말한다. 일반적으로, **메모리 위치나 참조하고, 식별자를 가지고 있는 식**를 lvalue라고 한다. 
### rvalue
rvalue의 정의도 비슷하게 operator= 에서 오른쪽에 들어갈 수 있는 값을 말한다. 그래서 모든 lvalue는 rvalue이지만 rvalue는 lvalue일 수도 있고 아닐 수 있다.  
일반적으로는 **메모리 위치가 있고, 식별자가 없는 식**를 rvalue라고 한다.
```cpp
#define rvalue 42
int lvalue;
lvalue = rvalue;
```

## value category
lvalue와 rvalue도 여러가지로 나뉜다. c++17 standard 에서는 아래와 같이 value의 category를 나누게 된다.  
![value-category]({{ site.url }}{{ site.baseurl }}/assets/images/value_categories.png){: .align-center}
### glvalue ( generalized lvalue )
식별자로 정의되는 모든 식을 뜻한다.
```cpp
int a = 10; // a is glvalue
```

### prvalue ( pure rvalue )
아래의 두가지를 평가하는 식이다.  
1. built-in operator ( +, - , etc... ) 으로 계산하는 식
2. 초기화 된 개체

**특성**

```cpp
struct S {
    S() : m{42} {}
    S(int a) : m{a} {}
    int m;
};
 
int main() {
    int a = 1 + 3; // 1 + 3 is prvalue
    S s = S{}; // S{} is prvalue
}
```

### xvalue ( eXpiring value )
glvalue 이지만 다시 사용이 가능한 value를 뜻한다.
```cpp
class Foo {
    int value;
};

int main() {
    Foo f1;
    Foo f2 = std::move(f1); // std::move(f1) is xvalue
}
```

### lvalue
glvalue 중에 xvalue가 아닌 식이다.

### rvalue
prvalue거나 xvalue인 식이다.

### 확인 방법
value category 중에 어디에 포함되는지는 c++의 `decltype` 과 `true_type`, `false_type` 으로 확인이 가능하다. 아래의 코드는 expression이 어느 카테고리에 들어가는지 컴파일타임에 확인하는 코드이다. 
```cpp
// reference: https://en.cppreference.com/w/cpp/language/value_category

#include <type_traits>
#include <utility>

template <class T> struct is_prvalue : std::true_type {};
template <class T> struct is_prvalue<T&> : std::false_type {};
template <class T> struct is_prvalue<T&&> : std::false_type {};

template <class T> struct is_lvalue : std::false_type {};
template <class T> struct is_lvalue<T&> : std::true_type {};
template <class T> struct is_lvalue<T&&> : std::false_type {};

template <class T> struct is_xvalue : std::false_type {};
template <class T> struct is_xvalue<T&> : std::false_type {};
template <class T> struct is_xvalue<T&&> : std::true_type {};

int main()
{
	int a{ 42 };
	int& b{ a };
	int&& r{ std::move(a) };

	// Expression `42` is prvalue
	static_assert(is_prvalue<decltype((42))>::value, "");

	// Expression `a` is lvalue
	static_assert(is_lvalue<decltype((a))>::value, "");

	// Expression `b` is lvalue
	static_assert(is_lvalue<decltype((b))>::value, "");

	// Expression `std::move(a)` is xvalue
	static_assert(is_xvalue<decltype((std::move(a)))>::value, "");

	// Type of variable `r` is rvalue reference
	static_assert(std::is_rvalue_reference<decltype(r)>::value, "");

	// Type of variable `b` is lvalue reference
	static_assert(std::is_lvalue_reference<decltype(b)>::value, "");

	// Expression `r` is lvalue
	static_assert(is_lvalue<decltype((r))>::value, "");
}
```

## 결론
c++ 의 **value category 는 크게 5가지 ( glvalue, prvalue, lvalue, xavlue, rvalue ) 정도로 나뉜다.** 하지만 실제로 코드를 보고 이 value가 어떤 category인지 이해하는 것은 쉽지 않아서 더 많은 예제와 많은 공부가 필요할 것으로 보인다.

예를들어서
```cpp
#include <iostream>
using namespace std;

struct S {
    S() : m{42} {}
    S(int a) : m{a} {}
    int m;
};
 
int main() {
    S s = S{}; // S{} is prvalue
    cout << (S{} = S{7}).m << endl;
}
```
이러한 코드를 보자. `S{}` 는 prvalue 로 임시객체이다. 그런데 `(S{} = S{7})` 이 expression이 문제없이 돌아간다. prvalue는 대입의 왼쪽에 나올 수 없는데 왜 그런걸까? ( 이유: operator= 에서는 prvalue가 lvalue로 변경된다. 추후 왜 그런지에 대해서 포스팅하겠다. )

> **여러 실제 예제들에 대해서 이해하기 위해서는 그냥 카테고리의 정의에 많은 c++ 지식이 필요할 것으로 보인다.**

## 참조
[cpp reference - value category](https://en.cppreference.com/w/cpp/language/value_category)  
[microsoft learn - value category](https://learn.microsoft.com/en-us/cpp/cpp/lvalues-and-rvalues-visual-cpp?view=msvc-170)  
[microsoft learn - lvalues and rvalues](https://learn.microsoft.com/en-us/cpp/cpp/lvalues-and-rvalues-visual-cpp?view=msvc-170)  
[microsoft learn - built-in operators](https://learn.microsoft.com/en-us/cpp/cpp/cpp-built-in-operators-precedence-and-associativity?view=msvc-170)