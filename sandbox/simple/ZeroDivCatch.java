import java.lang.*;

public class ZeroDivCatch {
  public static void main(String[] args) {
    try {
      int i = 1, j = 0;
      int t = i / j;
      System.out.println(i + "/" + j + "=" + t);
    } catch (ArithmeticException ex) {
      System.out.println("ArithmeticException was raised");
    }
  }
}
