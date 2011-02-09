class Bottles
{
  public static void main(String args[]) {
    System.out.println("99 bottles of beer on the wall, 99 bottles of beer.");
    for (int beers = 98; beers > 0; --beers) {
      String bottleWord = beers == 1 ? "bottle" : "bottles";
      System.out.println("Take one down and pass it around, " + beers + " " + bottleWord + " of beer on the wall.");
      System.out.println();
      System.out.println(beers + " " + bottleWord + " of beer on the wall, " + beers + " " + bottleWord + " of beer.");
    }
    System.out.println("Take one down and pass it around, no more bottles of beer on the wall.");
    System.out.println();

    System.out.println("No more bottles of beer on the wall, no more bottles of beer.");
    System.out.println("Go to the store and buy some more, 99 bottles of beer on the wall.");
  }
}
