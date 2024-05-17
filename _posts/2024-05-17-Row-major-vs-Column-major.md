---
layout: single
title: "Row Major vs Column Major"
excerpt: "행렬 저장하는 방식에 대해서 정리하는 글입니다."
categories:
  - Back To Basics
tags:
  - graphics
  - directx
  - math
  - HLSL
---
! 틀린 내용이 있을 수 있습니다. 틀린 내용이 있다면 댓글 부탁드립니다.
{: .notice--danger}  
모든 테스트는 visual studio 22 에서 진행했습니다.
{: .notice--info}

## 개요
matrix 저장방식인 row major 와 column major의 차이점과 실제 사용예제를 설명한다.

## 정의
```
matrix M
[a b c d]
[e f g h]
[i j k l]
[m n o p]
```
모든 index는 zero-base입니다.
{: .notice--info}  

### Row Major
matirx를 저장할 때 **행을 기준으로 저장**하는 방식을 말한다.
`matrix M` 의 메모리는  
 `(a b c d) (e f g h) (i j k l) (m n o p)` 로 저장된다.

### Column Major
matrix를 저장할 때 열을 기준으로 저장하는 방식을 말한다.
`matrix M` 의 메모리는  
 `(a e i m) (b f j n) (c g k o) (d h l p)` 로 저장된다.

## 주의할 점
### matrix element 의 위치
row major 와 column major는 **순수하게 저장하는 방식에 대한 내용이다**. matrix의 (i, j) 의 값은 바뀌지 않는다. 하지만 어떻게 저장하느냐에 따라서 **메모리의 위치는 바뀔 수 있다.**  

예를 들어서 matrix M 의 (1, 2) 를 접근하고 싶다고 할 때  

> **row-major**: M[1][2]  
> **column-major**: M[2][1]  

위 처럼 다른 방식으로 접근해야한다.

### 곱셈
major는 저장하는 방식의 차이이므로 matrix 곱셈 방식은 달라지지 않는다. 하지만 메모리의 위치가 달라졌기 때문에 계산식은 달라질 수 있다.
```
[a b c d]   [x]
[e f g h] * [y] = [a*x + b*y + c*z + d*w, ... ]
[i j k l]   [z]
[m n o p]   [w]
```
이러한 식이 있을 때 `b` 는 **row-major일 때는 M[0][1]** 이지만 **column-major일 때는 M[1][0]** 으로 접근해야한다.

## 사용 예제
### DirectX11
docs를 보면 `XMMATRIX`가 **row major 로 정의**되었다고 되어있다.  

docs만 보면 아쉬우니 간단하게 `DirectX::XMMATRIX`가 어떻게 정의되어있는지 잠깐 보고 가자.
```cpp
#ifdef _XM_NO_INTRINSICS_
    struct XMMATRIX
#else
    XM_ALIGNED_STRUCT(16) XMMATRIX
#endif
    {
#ifdef _XM_NO_INTRINSICS_
        union
        {
            XMVECTOR r[4];
            struct
            {
                float _11, _12, _13, _14;
                float _21, _22, _23, _24;
                float _31, _32, _33, _34;
                float _41, _42, _43, _44;
            };
            float m[4][4];
        };
#else
        XMVECTOR r[4];
#endif
// constructors...
```
위 코드는 `DirectX::XMMATRIX` 의 헤더 파일의 정의부분이다. `XMVECTOR r[4];` 로 정의되어있는것을 확인할 수 있다.

그리고 `DirectX::XMVECTOR`는 
```cpp
    using XMVECTOR = __m128;
```
로 정의 되어있고 `__m128` 은 microsoft 내부적으로 사용하는 SIMD 확장 명령에 사용되는 변수로 연속된 128bits를 뜻한다. (아무튼 빠르게 계산해준다.)

> 연속된 메모리 4개로 matrix 를 구현하고 있다고 row major 인것은 아니지만 `r[4]` 라는 변수를 사용한 것과 `union` 으로 정의된 배열 모양을 보면 row major라고  이해해도 괜찮을 것 같다.

### HLSL
docs에 따르면 신기하게도 DirectX에서 사용하는 **HLSL matrix의 major는 column major** 이다.

위와 같은 이유 때문에 DirectX 에서 hlsl의 matrix로 데이터를 넘길 때는 `transpose` 해서 넘겨야한다.

> 그래서 일반적으로 `world * view * projection` 로 vertex 변환을 진행하는데, CPU 단계 (DirectX) 에서 계산된 결과를 GPU 단계 (HLSL vertex shader) 에서 사용할 때는 transpose 해서 넘기게 된다.

![image-center]({{ site.url }}{{ site.baseurl }}/assets/images/constant_buffer_screenshot.png){: .align-center}  
위 사진은 hlsl 에 저장된 vertex를 `(-10, -9, -2.5)` 만큼 이동하는 matrix이다.  
데이터를 확인하면 column major 인 것을 확인할 수 있다.

## 결론
**matrix에서 major는 단순히 저장하는 방식일 뿐**이다. 편의에 의해서 계산 방식을 바꿀 순 있지만 계산의 효율성 문제지 저장의 문제가 아니다. (이에 관련해서 추후에 포스팅 예정이다)

## 참조
[Microsoft Learn: XMMATRIX structure](https://learn.microsoft.com/en-us/windows/win32/api/directxmath/ns-directxmath-xmmatrix)  
[Microsoft Learn: __m128](https://learn.microsoft.com/ko-kr/cpp/cpp/m128?view=msvc-170)  
[Microsoft Learn: hlsl matrix ordering](https://learn.microsoft.com/ko-kr/windows/win32/direct3dhlsl/dx-graphics-hlsl-per-component-math#matrix-ordering)