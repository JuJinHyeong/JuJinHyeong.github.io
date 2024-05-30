---
layout: single
title: "[C++] 클래스(4) - 생성자, 소멸자"
excerpt: "클래스에서 생성자와 소멸자에 대해서 설명합니다."
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
클래스에서 사용되는 특수적인 함수인 생성자와 소멸자에 대해서 설명하고 각 특징에 대해서 설명한다.

## 생성자
### 정의
클래스의 인스턴스를 생성하거나 초기화 할 때 불러오는 함수이다.

### 특징
1. 클래스와 같은 이름을 사용한다.
2. 반환값이 없다.
3. 오버로드가 가능하다.
4. 멤버 이니셜라이즈가 가능하다.

### 기본 사용법
```cpp
class Point {
public:
	Point()
		:
		x(0), y(0)
	{};

	Point(int x, int y) // overload
		:
		x(x), y(y)
	{};

private:
	int x, y;
};
```

### 실제 작동 순서
인스턴스를 생성할 때 불러오는 함수라고 하는데 어떻게 작동하는 걸까?




## 참조
[Microsoft Learn - c++ constructor](https://learn.microsoft.com/ko-kr/cpp/cpp/constructors-cpp?view=msvc-170)  
