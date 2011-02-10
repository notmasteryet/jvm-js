import java.lang.*;
import gen1.ClassGen1;

@Deprecated
public class Gen1 {
  public static void main(String[] args) {
    ClassGen1<String> t = new ClassGen1<String>("Test1");
    t.print();
  }
}

