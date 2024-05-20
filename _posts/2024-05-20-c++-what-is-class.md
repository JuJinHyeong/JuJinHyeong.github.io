---
layout: single
title: "[C++] 클래스(1) - 클래스란 무엇인가?"
excerpt: "c++의 class의 정의와 사용에 대해서 설명합니다."
categories:
  - Back To Basics
tags:
  - c++
  - class
  - syntax
---
! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 (v143) 으로 진행했습니다.
{: .notice--info}

## 개요
c++의 class의 정의와 클래스의 특징에 대해서 설명한다.

## class란?
### 정의
class란 프로그래머가 class, struct, union 중 하나로 선언한 **접근을 제한할 수 있는 변수( member variables )와 함수( member function ) 모음**을 말한다.

### 선언
#### 구조
```
[template-spec]
[class-key] [decl-spec] [tag [: base-list ]]
{
   member-list
} [declarators];
[ class-key ] tag declarators;
```

**template-spec**  
template spec을 정의한다.

**class-key**  
class, struct 을 사용한다.

**decl-spec**  
class를 어떻게 정의할지에 대한 옵션이다.  
[_declspec](https://learn.microsoft.com/en-us/cpp/cpp/declspec?view=msvc-170)

**tag**  
class의 이름이다.

**base-list**  
부모 클래스들이다. `public`, `protected`, `private`의 접근 제어자와 `virtual` 키워드를 사용할 수 있다.  
추후 상속 포스팅으로 자세한 설명을 할 예정이다.

**member-list**  
class member들을 정의한다.

**declarators**  
개체들의 이름을 정의한다.

#### member-list
1. **special function**  
   자동으로 생성해주는 함수들이다. 종류로는 
   `default constructor`, `destructor`, `copy constructor`, `copy assign operator`, `move constructor`, `move assign operator` 이렇게 6개가 있다.  
2. **member function**  
   static function, member function 두 가지로 나뉜다.
3. **data members**  
   static data, member data 두 가지로 나뉜다. 데이터 정의하듯 사용한다.
4. **nested class**  
   class 내부적으로 class를 다시 정의할 수 있다. `::` 접근자를 통해서 접근가능하다.
    ```cpp
    class A {
    public:
        class B {
            
        };
    };

    A::B b;
    ```

#### 예시
```cpp
class Base {};

template<typename T>
class alignas(16) ClassName final : public Base{
// special functions...
private:
    class Nested {};
public:
    static void StaticFunc() {};
    void MemberFunc() {};
private:
    T mTemplate;
    Nested mNested;
    int mI;
    static int mStaticI;
};
```

## 멤버 접근 제어
### friend
`friend` 키워드는 클래스 멤버가 아닌데 **클래스 멤버 수준의 접근 권한을 줄 때 사용**한다. 모든 멤버에게 줄 수도 있고, 특정 멤버에게만 줄 수도 있다.  

좀 더 사람적으로 생각한다면 **너는 내 친구니깐 내 모든 걸 보여줄게** 하는 것이라고 생각하면 이해가 쉬울 것 같다. 하지만 친구는 나를 친구라고 생각 안 할 수 있다.( ㅠㅠ )

```cpp
/* ---------- class friend ------------ */
class Me {
    friend Friend;
private:
    int secret;
};

class Friend {
public:
    int GetSecret(Me& me) {
        return me.secret;
    }
private:
    int secret;
};

int Me::GetSecret(Friend& f) {
    return f.secret; // error: C2248
}

/* ----------- function friend ------------ */
class B;
class A {
public:
    int Func1(B& b);

private:
    int Func2(B& b);
};

class B {
private:
    int _b;

    // A::Func1 is a friend function to class B
    friend int A::Func1(B&);
};

int A::Func1(B& b) { return b._b; }   // OK
int A::Func2(B& b) { return b._b; }   // C2248
```
위 코드에서 Func1 을 class B 밑에 정의한 이유는 **class A를 선언할 때 B의 정보를 모르고 있기 때문에** _b 에 접근할 수 없어서이다. **전방선언( forward declaration )을 찾아보자.**
{: .notice--info}

`friend` 는 그 class에만 적용된다. 자식이나 부모와는 관련이 없다. ( 내 친구에게만 보여준 비밀인데 자식이나 부모가 알고 있다면 슬플 것 같다. )
```cpp
class Parent {
public:
    int GetSecret(Me& me) {
        return me.secret; // error: C2248
    }
};

class Friend : public Parent {
public:
    int GetSecret(Me& me) {
        return me.secret;
    }
};

class FriendChild : public Friend {
public:
    int GetSecret(Me& me) {
        return me.secret; // error: C2248
    }
};
```

### private
**클래스 멤버 함수와 friend class 말고는 접근이 불가능하게 하는 제어자**이다. 자식도 접근이 불가능하다.
```cpp
class A {
public:
    int GetSecret() {
        secret; // ok
    }
private:
    int secret;
};

class B : A {
private:
    int GetParentSecret() {
        secret; // error
    }
};
```

### protected
**클래스 멤버 함수, firend class, 직접 상속 받은 class의 멤버 함수들**이 접근가능하게 한다.
```cpp
class A {
public:
    int GetSecret() {
        secret; // ok
    }
protected:
    int secret;
};

class B : public A {
private:
    int GetParentSecret() {
        secret; // ok
    }
};
```

### public
**어떤 function에서도 접근이 가능**하게 해준다.
```cpp
class A {
public:
    int secret;
};

int main() {
    A a;
    a.secret; // ok
    return 0;
}
```

## class vs struct
`class`와 `struct`는 본질적으로( 어셈블러 단에서 ) 차이가 전혀 없다. 하지만 단 한가지 다른 것은 **기본 접근제어자가 `class`는 `private`, `struct`는 `public` 이라는 것**이다.  

하지만 일반적으로 c++ convention에서는 `class`와 `struct`를 구분하기 위해서 **변수만 저장하고 있는 `class`만** `struct`로 사용한다. 

#### 예제
```cpp
struct Point {
    int x, y; // public
};

class CPoint {
public:
    void SetPoint(int x, int y) {
        this->x = x;
        this->y = y;
    }
private:
    int x, y;
};
```
![value-category]({{ site.url }}{{ site.baseurl }}/assets/images/struct_vs_class.png){: .align-center}
위의 사진에서 볼 수 있듯 `class`와 `struct`가 **메모리 레이아웃에서 차이가 없는 것**을 확인할 수 있다.

## 출처
[Microsoft Learn - Classes](https://learn.microsoft.com/ko-kr/cpp/cpp/class-cpp?view=msvc-170)  
[cpp reference - Classes](https://en.cppreference.com/w/cpp/language/classes)  
[Wiki - classes](https://en.wikipedia.org/wiki/C%2B%2B_classes)  
[google cpp coding convention](https://google.github.io/styleguide/cppguide.html#Structs_vs._Classes)  
[Microsoft Learn - Class Member Overview](https://learn.microsoft.com/en-us/cpp/cpp/class-member-overview?view=msvc-170)  
[Microsoft Learn - friend](https://learn.microsoft.com/en-us/cpp/cpp/friend-cpp?view=msvc-170)  
[Microsoft Learn - private](https://learn.microsoft.com/en-us/cpp/cpp/private-cpp?view=msvc-170)  
[Microsoft Learn - protected](https://learn.microsoft.com/en-us/cpp/cpp/protected-cpp?view=msvc-170)  
[Microsoft Learn - public](https://learn.microsoft.com/en-us/cpp/cpp/public-cpp?view=msvc-170)  
[Microsoft Leanr - class and struct](https://learn.microsoft.com/en-us/cpp/cpp/classes-and-structs-cpp?view=msvc-170)