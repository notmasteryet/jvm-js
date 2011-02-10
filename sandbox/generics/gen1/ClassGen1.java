package gen1;

import java.lang.System;

public class ClassGen1<T> {
  T a;

  public ClassGen1(T a) {
    this.a = a;
  }

  public void print() {
    System.out.println(a);
  }
}
