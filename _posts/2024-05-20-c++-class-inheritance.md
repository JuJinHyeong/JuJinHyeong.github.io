---
layout: single
title: "[C++] 클래스(2) - 클래스의 상속"
excerpt: "c++의 class의 상속에 대해서 설명합니다."
categories:
  - Back To Basics
tags:
  - c++
  - class
  - syntax
  - oop
---
! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 (v143) 으로 진행했습니다.
{: .notice--info}

## 개요
c++ 클래스의 상속에 대해서 사용방법과 실제 메모리가 어떻게 되는지 대해서 설명한다.

## 상속이란
### 정의
특정 클래스는 **다른 클래스의 멤버들을 특정 조건으로 받아서 사용**할 수 있다. **이를 "상속( inheritance )"** 라고 한다.  
**상속 받은 class를 derived class, 상속 하는 class를 Base class**라고 부른다.  
일반적으로 OOP에서 객체들을 구조화할 때 많이 사용된다.

### 문법
```cpp
class Derived : [virtual] [access-specifier] Base
{
   // member list
};
class Derived : [virtual] [access-specifier] Base1,
   [virtual] [access-specifier] Base2, . . .
{
   // member list
};
```
#### access-specifier
`public, protected, private` 3가지 중 하나이다.  
상속받은 class ( derived class )는 가장 높은 access-specifier의 접근제어 수준을 가진다.

**public -> protected -> private 순서로 접근제어 수준이 높아진다.**
{: .notice--info}

```cpp
class Base {
public:
	int a;
};

class Derived : private Base { }; // a is private in Derived

class Derived2 : public Derived {
public:
	void print() {
		cout << a << endl; // error
	}
};
```

위의 예시를 보면 `int a;` 는 `Base`에서는 `public` 이지만 상속 받을 때 `private`으로 상속 받았기 때문에 `Derived`에서는 `private` 으로 정의된다.

#### 다중 상속
여러개의 Base class를 가질 때는 `,` 로 구분해서 상속 받을 수 있다.

## 상속 종류
### 단일 상속 ( single inheritance )
#### 개요
일반적인 상속을 뜻한다. **하나의 Base class 만을 가지는 상속**을 뜻한다.  

예를 들어 `Shibainu` ( 시바견 ) 라는 class를 생각해보자.  
`Shibainu`는 `Dog`이고 `Dog`는 `Animal`이다. 이를 상속관계로 표현하면 이렇게 표현할 수 있다.
```cpp
class Animal { };

class Dog : public Animal { };

class Shibainu : public Dog { };
```

이럴 때 `Dog`는 `Shibainu`의 `direct inheritance class` 라고 부르고, `Animal`은 `indirect inheritance class` 라고 부른다.

#### 조건
Base class는 Derived class 보다 앞에 정의 되어있어야한다. **즉, Base class는 complete class 여야한다.**

왜 그런지는 Derived 가 만들어지기 위해서는 Base 가 먼저 만들어져야하기 때문일 것이다. ( 정확하지 않음 )
{: .notice--info}

#### Ambiguous
일반적으로 접근할 때 이름이 다르면 이름으로 접근하면 되지만 멤버의 이름이 같은 경우가 있다. 이럴 때는 정확하게 `class::member` 로 접근해서 모호함을 해결 할 수 있다.

```cpp
class Base {
public:
	int a;
};

class Derived : public Base {
public:
	int a;
};

class Derived2 : public Derived {
public:
	void test() {
		a = 10; // ambiguous. Base::a or Derived::a?
      Base::a = 10;
      Derived::a = 12;
	}
};
```

#### 메모리 구조
c++ 표준에서는 클래스를 상속 받을 때의 메모리 구조를 보장하고 있지 않다. 구현의 문제이고, 컴파일러마다 다르게 작동할 수 있다.
{: .notice--info}

일반적으로는 Base class가 Derived class 앞에 존재하는 형식으로 구현되어있다.

```cpp
class Base {
public:
	virtual ~Base() {};
	int a;
};

class Derived : public Base {
public:
	int b;
};

class Derived2 : public Derived {
public:
	int c;
};
```

위와 같은 구조에서 Derived2를 만들기 위해서 Base는 맨 위에 생성되고 그 밑에 Derived, Derived2 순서로 생성된다.

![memory-layout]({{ site.url }}{{ site.baseurl }}/assets/images/class-inheritance-derived2-memory-layout.png){: .align-center}

위의 사진처럼 align이 8byte로 고정되고 뒤로 4byte 씩 추가되는 것을 볼 수 있다.

##### vptr의 위치

`visual studio 22(v143)`에서는 vptr 의 위치가 항상 앞으로 고정된다.

예를 들어서 이런 경우를 보자.

```cpp
class Base {
public:
	int a;
};

class Derived : public Base {
public:
	virtual ~Derived() {};
	int b;
};

class Derived2 : public Derived {
public:
	int c;
};
```

이렇게 되어있다면, 처음 생각드는 것은 `Base::a / Derived::vptr , Derived::b / Dervied2::c` 이렇게 되어있는 것을 생각할 것이다. 하지만 실제로 visual studio 에서는 `Derived::ptr`이 제일 앞에 있고 `Base::a` 부터 만들어진다.

![memory-layout2]({{ site.url }}{{ site.baseurl }}/assets/images/class-inheritance-derived2-memory-layout2.png){: .align-center}

사진처럼 맨 앞에 Derived::ptr이 있고, 뒤에 align 되어있는 것을 확인할 수 있다.

### 다중 상속 ( multiple inheritance )

만악의 근원이다.
{: .notice--danger}

#### 개요
최신 언어들과는 다르게 c++에서는 다중상속을 지원한다. **상속을 여러개의 Base class에서 받는 상속**이다.

예를 들어 `Me`는 `Mother`와 `Father`의 특징들을 물려받았다. 그렇다면 이렇게 표현할 수 있다.
```cpp
class Mother {};

class Father {};

class Me : public Mother, public Father {};
```

#### 주의
`Me`를 만들기 위해서는 **`Mother`를 만들고, `Father`를 만들게 된다. ( 순서가 선언에 의해 고정되어 있다. )**   
`Me`를 파괴할 때는 반대로 **`Father`를 파괴하고 `Mother`를 파괴한다. ( 순서가 선언에 의해 고정되어 있다. )**

class 선언에서 상속 순서는 메모리 레이아웃에 영향을 미칠 수 있다. 예상하지 못한 행동을 하지 않도록 주의해야한다.
{: .notice--warning}

#### virtual
위의 예시는 사실 Mother 도 Father 도 Human 이기 때문에 아래와 같이도 생각할 수 있다.
```cpp
class Human {};

class Mother {};

class Father {};

class Me : public Mother, public Father {};
```
이러면 앞에서 설명한대로 Me를 생성하면 Human + Mother를 생성하고, Human + Father를 생성한다. 그렇게 되면 **Human이 두 개가 생성되는 문제가 생긴다.** 그리고 이러한 구조를 **죽음의 다이아몬드** 라고 부른다.

```
        Human
       /      \
      V        V
  Mother        Father
       \      /
        V    V
          Me
```

이때의 메모리 구조는 이런식이 된다.  
![value-category]({{ site.url }}{{ site.baseurl }}/assets/images/human_me_small.png){: .align-center}

이 때 두 개를 생성하지 않고 하나만 생성하게 해주는 것이 `virtual` 키워드이다.

각 Base class마다 `virtual` 을 선언해줘야해서 `virtual`이 선언된 `class` 끼리는 하나로 통일되지만 `virtual`이 선언되지 않은 상속은 여전히 생성을 한다.

```cpp
class Base {};
class Derived1 : public Base {};
class Derived2 : public Base {};
class Derived3 : public Base {};
class DerivedD : virtual public Derived1, virtual public Derived2, public Derived3 {};
```
이런 구조라면 Base는 2개가 만들어진다.

이론은 이런데... 실제로 메모리 구조를 확인해보면 각각 생성된다. 왜 그런지는 잘 모르겠습니다. 댓글 부탁드립니다.
{: .notice--danger}


#### Ambiguous
단일 상속과 비슷하게 모호한 멤버로 접근할 때 `Parent::Base::member` 처럼 정확한 클래스 위치로 접근하면 모호함을 해결할 수 있다. 

## 결론
이 포스팅으로 **class를 상속할 때 어떻게 하는지, 상속의 종류, 각 상속의 특징에 대해서 알아보았다.** 이 외에도 더 많은 상속에 관련된 자세한 내용이 있으나 짧은 식견 이슈로 더 자세한 내용은 다른 정리된 내용을 참고하면 좋을 거 같다.

## 참조
[Microsoft Learn - Inheritance Overview](https://learn.microsoft.com/en-us/cpp/cpp/inheritance-cpp?view=msvc-170)  
[Microsoft Learn - Single Inheritance](https://learn.microsoft.com/en-us/cpp/cpp/single-inheritance?view=msvc-170)  
[Microsoft Learn - Multiple Inheritance](https://learn.microsoft.com/en-us/cpp/cpp/multiple-base-classes?view=msvc-170)