package main

import (
	"bufio"
	"os"
	"strconv"
)

func main() {

}

var sc = bufio.NewScanner(os.Stdin)

func init() {
	const maxCapacity = 1024 * 1024 * 10
	buf := make([]byte, bufio.MaxScanTokenSize)
	sc.Buffer(buf, maxCapacity)
	sc.Split(bufio.ScanWords)
}

func nextInt() int {
	sc.Scan()
	i, err := strconv.Atoi(sc.Text())
	if err != nil {
		panic(err)
	}
	return i
}

func nextString() string {
	sc.Scan()
	return sc.Text()
}

func nextFloat() float64 {
	sc.Scan()
	f, err := strconv.ParseFloat(sc.Text(), 64)
	if err != nil {
		panic(err)
	}
	return f
}
