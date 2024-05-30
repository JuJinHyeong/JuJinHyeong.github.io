---
layout: single
title: "[C++] 클래스(3) - virtual function"
excerpt: "클래스에서 virtual function에 대해서 설명합니다."
categories:
  - Back To Basics
tags:
  - c++
  - class
  - syntax
  - virtual function
  - oop
---
! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 (v143) 으로 진행했습니다.
{: .notice--info}

## 개요
c++에서 다형성을 구현하는데에 필수적인 **가상함수( virtual function )에 대해서 설명하고 특징과 내부 동작에 대해서 설명**한다.

## virtual function이란
### 정의
**Derived class에서 다시 정의해야하는 멤버 함수이다.** Base class 의 포인터로 Dervied class를 가리킬 때 Derived class를 불러올 수 있게 한다.

### 사용법

`virtual` 키워드로 가상함수를 정의한다.  

`override` 키워드로 가상함수를 재정의한다고 명시한다. `override` 키워드가 없어도 재정의가 가능하다. 하지만 `override` 키워드가 붙은 가상함수가 재정의를 하지 않으면 에러를 내므로 **가상함수를 재정의 하는 것이라면 붙여서 재정의하는 함수라고 명시하는 것이 좋다.**

### 예제
```cpp
#include<iostream>
using namespace std;

class Base {
public:
    virtual void Func() {
        cout << "This is Base Func" << endl;
    }
    virtual void Func2() {
        cout << "This is Base Func2" << endl;
    }
    int a = 0;
};

class Base2 {
public:
    virtual void Func3() {
        cout << "This is Base2 Func" << endl;
    }
    int b = 0;
};

class Derived : public Base, public Base2 {
public:
    virtual void Func() override {
        cout << "This is Derived Func" << endl;
    }
    virtual void Func3() override {
        cout << "This is Derived Func3" << endl;
    }
    int c = 0;
};

void Test() {
    Base* b = new Derived();
    b->Func(); // This is Derived Func
    b->Func2(); // This is Base Func2
    Base2* b2 = dynamic_cast<Base2*>(b);
    b2->Func3(); // This is Derived Func3
}
```

## 내부 동작
### function 선택
#### 고민
Base class에서 Derived class의 함수가 나오는 것이 어떻게 가능한걸까? 마법처럼 언어에서 Derived class로 체크하고 연결 해주는 것인가?  
결론을 말하자면 vtable 이라는 가상함수를 위한 table 참조를 통해서 가능하다.

코딩에서 마법은 없다. 뒤에서 마법처럼 해주는 것이다.
{: .notice--danger}  

#### vtable
vtable 은 **가상함수가 있는 class 마다** 가지고 있는 테이블로 **가상함수의 정보를 저장하는 테이블**이다.

가상함수 정보를 저장하고 있다가 **런타임에 가상함수를 부를 때 vtable을 참조해서 그에 맞는 함수를 불러온다.**

이게 어떻게 되는 걸까?

#### 구현
c++ 표준에서는 vtable의 구현 방법에 대해서 정의하고 있진 않지만 일반적으로 컴파일러는 **가상함수가 정의된 class에는 숨겨진 멤버변수로 vtable 의 위치를 추가하는 방식**으로 구현한다.

vtable 위치를 저장하는 변수를 일반적으로 `vptr`, `vfptr` 이라고 부르고, class의 특정위치( 일반적으로 맨 앞 혹은 맨 뒤 )에 저장된다.

Base class 포인터에서 가상함수를 부르면 **vptr을 통해서 vtable로 접근해서 맞는 함수 포인터를 불러와서 실행**한다.

vptr은 생성 당시 정해지므로 컴파일러는 **이 포인터의 실제 개체가 무엇인지 알 필요가 없다.**
{: .notice--info}

이 과정처럼 런타임에 실행할 함수가 정해지는 것을 **동적바인딩( dynamic binding )**이라고 한다.
{: .notice--info}

vtable은 **class 마다 존재하므로( 개체가 아니다! static 같은 class마다 존재하는 값이다 ) 같은 class를 가리키면 같은 vptr을 가진다.**

아래의 예제로 vptr 의 값을 확인해보자.

```cpp
void GetVptr() {
    Derived d;
    // Get Base vptr in d
    long long* dBaseVptr = (long long*)*(long long*)&d;
    // Get Base2 vptr in d
    long long* dBase2Vptr = (long long*)*((long long*)&d + 2);

    cout << "Base1 vptr: " << dBaseVptr << endl;
    cout << "Base2 vptr: " << dBase2Vptr << endl;

    Derived d2;
    // Get Base vptr in d2
    long long* dBaseVptr2 = (long long*)*(long long*)&d2;
    // Get Base2 vptr in d2
    long long* dBase2Vptr2 = (long long*)*((long long*)&d2 + 2);

    cout << "Base1 vptr (d2): " << dBaseVptr2 << endl;
    cout << "Base2 vptr (d2): " << dBase2Vptr2 << endl;

    assert(dBaseVptr == dBaseVptr2);
    assert(dBase2Vptr == dBase2Vptr2);
}
```
vptr 값을 비교하는 함수이다. `assert`로 비교해서 문제없이 실행된다. **Derived 가 다른 개체임에도 불구하고 같은 vptr을 가지는 것**을 알 수 있다.

#### 실행 과정
위의 예제가 실제로 어떻게 작동하는지 확인해보자.

일단 먼저 Derived 의 메모리 레이아웃을 보면  
![derived_memory_layout]({{ site.url }}{{ site.baseurl }}/assets/images/virtual_derived_memory_layout.png){: .align-center}  
이렇게 `Base` / `Base2` / `Derived` 순서로 메모리 레이아웃이 잡혀있다.
```cpp
Derived d;
cout << (long long)&d.a - (long long)&d << endl; // 8
cout << (long long)&d.b - (long long)&d << endl; // 24
cout << (long long)&d.c - (long long)&d << endl; // 32
```
위와 같은 함수로도 확인이 가능하다.

#### 어셈블러
맨 위의 예제를 어셈블러로 하나씩 살펴보자.  
1. 함수 초기화 / new 함수 호출
    ```cpp
    void Test() {
    00007FF71BB824F0  push        rbp  
    00007FF71BB824F2  push        rdi  
    00007FF71BB824F3  sub         rsp,158h  
    00007FF71BB824FA  lea         rbp,[rsp+30h]  
    00007FF71BB824FF  lea         rcx,[__053F72D8_main@cpp (07FF71BB9506Fh)]  
    00007FF71BB82506  call        __CheckForDebuggerJustMyCode (07FF71BB81497h)  
        Base* b = new Derived();
    00007FF71BB8250B  mov         ecx,28h  
    00007FF71BB82510  call        operator new (07FF71BB8104Bh)  
    00007FF71BB82515  mov         qword ptr [rbp+108h],rax  
    00007FF71BB8251C  cmp         qword ptr [rbp+108h],0  
    00007FF71BB82524  je          Test+5Bh (07FF71BB8254Bh)  
    00007FF71BB82526  mov         rdi,qword ptr [rbp+108h]  
    00007FF71BB8252D  xor         eax,eax  
    00007FF71BB8252F  mov         ecx,28h  
    00007FF71BB82534  rep stos    byte ptr [rdi]  
    00007FF71BB82536  mov         rcx,qword ptr [rbp+108h]  
    00007FF71BB8253D  call        Derived::Derived (07FF71BB813A7h)  
    00007FF71BB82542  mov         qword ptr [rbp+118h],rax  
    00007FF71BB82549  jmp         Test+66h (07FF71BB82556h)  
    00007FF71BB8254B  mov         qword ptr [rbp+118h],0  
    00007FF71BB82556  mov         rax,qword ptr [rbp+118h]  
    00007FF71BB8255D  mov         qword ptr [b],rax  
    ```
   `Test` 함수를 위한 메모리 공간을 확보하고, `b` 변수에 `new Derived();` 의 결과값을 대입한다.
2. Func1 함수 call
    ```cpp
        b->Func();
    00007FF71BB82561  mov         rax,qword ptr [b]  
    00007FF71BB82565  mov         rax,qword ptr [rax]  
    00007FF71BB82568  mov         rcx,qword ptr [b]  
    00007FF71BB8256C  call        qword ptr [rax]  
    ```
    b가 가리키는 값을 rax로 옮기고, rax가 가리키는 값을 rax로 다시 옮긴다.  
    그리고 rax 가 가리키는 곳을 함수로 부른다.
    즉, b의 시작위치에 vptr이 존재하므로 vptr로 찾아가고 vptr이 가리키는 곳에 첫번째에 Func의 포인터가 있어서 그 값을 불러서 사용한다.
3. Func2 함수 call
    ```cpp
        b->Func2();
    00007FF71BB8256E  mov         rax,qword ptr [b]  
    00007FF71BB82572  mov         rax,qword ptr [rax]  
    00007FF71BB82575  mov         rcx,qword ptr [b]  
    00007FF71BB82579  call        qword ptr [rax+8]  
    ```
    Func2 를 부르는 과정도 비슷하다. 하지만 다른 것이 하나 있는데, rax+8 로 vtable 의 2번째 값을 부른다는 것이다.( x64로 컴파일 했기 때문에 8byte 만큼 옮겨야한다 )  
    Func2 는 Base의 두번째 가상함수이고 이는 컴파일타임에 알 수 있기 때문에 8byte 만큼의 offset을 줘서 부를 수 있게 된다.
4. dynamic_cast로 Base2로 캐스팅
    ```cpp
        Base2* b2 = dynamic_cast<Base2*>(b);
    00007FF71BB8257C  mov         dword ptr [rsp+20h],0  
    00007FF71BB82584  lea         r9,[Base2 `RTTI Type Descriptor' (07FF71BB8F260h)]  
    00007FF71BB8258B  lea         r8,[Base `RTTI Type Descriptor' (07FF71BB8F240h)]  
    00007FF71BB82592  xor         edx,edx  
    00007FF71BB82594  mov         rcx,qword ptr [b]  
    00007FF71BB82598  call        __RTDynamicCast (07FF71BB81523h)  
    00007FF71BB8259D  mov         qword ptr [b2],rax  
    ```
    Func3 을 부르기 위해서 Base2 로 dynamic_cast 했다. b2에는 `__RTDynamicCast (07FF71BB81523h)` 의 결과 값이 들어가고 **이는 b 에 비해서 0x10 (16) 만큼 큰 값이다.**
5. Func3 함수 call
    ```cpp
        b2->Func3();
    00007FF71BB825A1  mov         rax,qword ptr [b2]  
    00007FF71BB825A5  mov         rax,qword ptr [rax]  
    00007FF71BB825A8  mov         rcx,qword ptr [b2]  
    00007FF71BB825AC  call        qword ptr [rax]  
    }
    ```
    Base2 에서 Func3 은 첫번째 가상함수이므로 b2의 vptr로 가서 vtable의 첫번째 함수를 불러와서 실행한다.

#### override
`override` 키워드는 virtual function을 재정의 할 때 **"이 함수 재정의하는 거에요~"** 하고 알려주는 키워드이다. `override` 키워드가 들어가있는데 **재정의하는 것이 아니면 컴파일 에러를 낸다.**

이 키워드는 되도록이면 사용하는 것이 좋다. 필자는 항상 const 나 c#의 out 등 무언가를 제한하는 키워드들은 적극적으로 사용하는 것을 추천한다. 언어단에서 제한해서 프로그래머의 실수를 줄이는 것은 매우 중요하다. ( 프로그래머도 사람이야! )
{: .notice--info}

```cpp
class Base {
public:
    virtual void Foo() {};
};

class Derived : public Base {
public:
    virtual void Foo() override {};
    virtual void Fooo() override {}; // error
};
```

## 순수가상함수( pure virtual function )
### 정의
순수가상함수는 가상함수 중에 `=0` 이라는 **순수지시자( pure specifier )를 통해서 정의된 가상함수**이다.

### 특징
순수가상함수가 정의된 class는 abstract class로 아래와 같은 용도로 사용할 수 없다.
1. 변수
2. 매개변수 타입
3. 함수 리턴 타입
4. 명시적 변환 타입

아래와 같은 예제는 사용할 수 없다.
```cpp
class Abstract {
public:
    virtual void Func() = 0;
    int a;
};

void Func() {
    Abstract b; // error
}
```

## 성능
앞에서 확인한 것 처럼 가상함수는 **메모리에 접근해서함수 함수포인터를 가져오는 방식**이어서 일반 함수를 부르는 것에 비해서 훨씬 느릴 수 밖에 없다.  
추가적으로 가상함수는 어떤 함수를 사용할지 모르기 때문에 inline 최적화도 할 수 없어서 더욱 차이가 날 수 있다.

> 가상함수를 사용하는 것이 항상 좋은 것은 아니다. 가상함수를 줄일 수 있다면 줄이는 것이 좋다.

### 예시
```cpp
class Shape {
public:
    struct Point {
        int x = 0, y = 0;
    };
    virtual void Draw() = 0;
};

class Triangle : public Shape {
public:
    virtual void Draw() override {
        // draw triangle
    }
    Point p[3];
};

class Square : public Shape {
public:
    virtual void Draw() override {
        // draw triangle
    }
    Point p[4];
};

void DrawCall() {
    Shape* s[10] = { 0 };
    for (int i = 0; i < 10; i++) {
        int a;
        cin >> a;
        if (a % 1) {
            s[i] = new Triangle();
        }
        else {
            s[i] = new Square();
        }
    }
    
    for (int i = 0; i < 10; i++) {
        s[i]->Draw();
    }
}
```
위와 같이 가상함수를 사용할 수도 있지만

아래와 같이 가상함수를 사용하지 않고도 비슷한 기능을 구현할 수 있다.
```cpp
class Shape {
public:
    struct Point {
        int x = 0, y = 0;
    };
    void Draw() {
        // draw points
    }
    vector<Point> points;
};

class Triangle : public Shape {
public:
    Triangle() {
        // set Triangle points;
    }
};

class Square : public Shape {
public:
    Square() {
        // set Square points;
    }
};

void DrawCall() {
    Shape* s[10] = { 0 };
    for (int i = 0; i < 10; i++) {
        int a;
        cin >> a;
        if (a % 1) {
            s[i] = new Triangle();
        }
        else {
            s[i] = new Square();
        }
    }

    for (int i = 0; i < 10; i++) {
        s[i]->Draw();
    }
}
```

## 결론
class에서 사용하는 **가상함수의 정의, 사용방법, 실제 구현**까지 살펴봤다.

다형성을 구현할 때 매우 중요한 기능이지만 **메모리에 접근해서 사용하는것**이므로 성능적으로 민감한 부분을 코딩한다면 **항상 벤치마크해보고 사용하는 것이 좋을 것 같다.**

## 참조
[google c++ coding convention](https://google.github.io/styleguide/cppguide.html#Inheritance)  
[Wiki - vtable](https://ko.wikipedia.org/wiki/%EA%B0%80%EC%83%81_%EB%A9%94%EC%86%8C%EB%93%9C_%ED%85%8C%EC%9D%B4%EB%B8%94)  
[Microsoft Learn - virtual function](https://learn.microsoft.com/ko-kr/cpp/cpp/virtual-functions?view=msvc-170)