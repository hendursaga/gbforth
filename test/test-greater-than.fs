[asm]

: test
  $1234 $5678 >
  $abcd $6789 >
  $aa55 $aa88 >
  $aa44 $aa22 >
  $4444 $4444 > ;

main: ' test # call,
ret,

[endasm]
